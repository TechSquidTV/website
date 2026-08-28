import { execFile as execFileCallback } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const SITE_URL = new URL("https://techsquidtv.com/");
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const INDEXNOW_KEY_FILE_PATTERN = /^[a-f0-9]{32}\.txt$/i;
const REVISION_PATTERN = /^[a-f0-9]{40}$/i;
const MAX_URLS_PER_REQUEST = 10_000;

interface CliOptions {
  baseRevision: string;
  headRevision: string;
  dryRun: boolean;
}

interface ChangedPath {
  beforePath?: string;
  afterPath?: string;
}

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

function parseOptions(args: readonly string[]): CliOptions {
  let baseRevision: string | undefined;
  let headRevision: string | undefined;
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }

    const value = args[index + 1];
    if (!value) {
      throw new Error(`Missing value for ${argument}.`);
    }

    if (argument === "--base") {
      baseRevision = value;
    } else if (argument === "--head") {
      headRevision = value;
    } else {
      throw new Error(`Unsupported argument: ${argument}.`);
    }

    index += 1;
  }

  if (!baseRevision || !headRevision) {
    throw new Error(
      "Usage: indexnow:submit --base <sha> --head <sha> [--dry-run].",
    );
  }

  if (
    !REVISION_PATTERN.test(baseRevision) ||
    !REVISION_PATTERN.test(headRevision)
  ) {
    throw new Error("IndexNow requires full Git commit SHAs.");
  }

  return { baseRevision, headRevision, dryRun };
}

function parseChangedPaths(output: string): ChangedPath[] {
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, firstPath, secondPath] = line.split("\t");

      if (!status || !firstPath) {
        throw new Error("Git returned an invalid changed-file record.");
      }

      if (status.startsWith("R") || status.startsWith("C")) {
        if (!secondPath) {
          throw new Error("Git returned an incomplete rename record.");
        }

        return { beforePath: firstPath, afterPath: secondPath };
      }

      if (status === "D") {
        return { beforePath: firstPath };
      }

      return { afterPath: firstPath };
    });
}

async function readGitFile(
  revision: string,
  filePath: string,
): Promise<string | undefined> {
  try {
    const { stdout } = await execFile(
      "git",
      ["show", `${revision}:${filePath}`],
      {
        encoding: "utf8",
      },
    );
    return stdout;
  } catch {
    return undefined;
  }
}

function isBlogPath(filePath: string): boolean {
  return /^src\/content\/blog\/.+\.(?:md|mdx)$/.test(filePath);
}

function blogRouteFromPath(filePath: string, source: string): URL | undefined {
  const fileMatch = /^src\/content\/blog\/(.+)\.(?:md|mdx)$/.exec(filePath);
  if (!fileMatch?.[1]) {
    return undefined;
  }

  const isDraft = /^draft:\s*true\s*$/im.test(source);
  if (isDraft) {
    return undefined;
  }

  const slugMatch = /^slug:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*$/im.exec(
    source,
  );
  const slug = (
    slugMatch?.[1] ??
    slugMatch?.[2] ??
    slugMatch?.[3] ??
    fileMatch[1]
  ).replace(/^\/+|\/+$/g, "");

  return new URL(`blog/${slug}/`, SITE_URL);
}

function pageRouteFromPath(filePath: string): URL | undefined {
  const pageMatch = /^src\/pages\/(.+)\.astro$/.exec(filePath);
  if (!pageMatch?.[1] || pageMatch[1].startsWith("api/")) {
    return undefined;
  }

  const segments = pageMatch[1].split("/");
  if (segments.some((segment) => segment.includes("["))) {
    return undefined;
  }

  const routeSegments = segments.filter((segment) => segment !== "index");
  return new URL(`${routeSegments.join("/")}/`, SITE_URL);
}

function needsSitemapRefresh(changedPaths: readonly ChangedPath[]): boolean {
  const siteWidePaths = new Set([
    "src/components/BaseHead.astro",
    "src/components/StructuredData.astro",
    "src/consts.ts",
    "src/layouts/BaseLayout.astro",
  ]);
  const blogWidePaths = new Set([
    "src/layouts/BlogPost.astro",
    "src/pages/blog/[...slug].astro",
    "src/pages/blog/tags/[tag].astro",
  ]);

  return changedPaths.some(({ beforePath, afterPath }) => {
    const paths = [beforePath, afterPath].filter(
      (path): path is string => path !== undefined,
    );
    return paths.some(
      (path) => siteWidePaths.has(path) || blogWidePaths.has(path),
    );
  });
}

async function getSitemapUrls(): Promise<URL[]> {
  const sitemapFiles = (await readdir("dist/client"))
    .filter((fileName) => /^sitemap-\d+\.xml$/.test(fileName))
    .sort();
  const urls = new Set<string>();

  for (const sitemapFile of sitemapFiles) {
    const sitemap = await readFile(`dist/client/${sitemapFile}`, "utf8");
    for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const location = match[1];
      if (location) {
        urls.add(location);
      }
    }
  }

  return [...urls].sort().map((url) => new URL(url));
}

async function getIndexNowKey(): Promise<string> {
  const keyFiles = (await readdir("public")).filter((fileName) =>
    INDEXNOW_KEY_FILE_PATTERN.test(fileName),
  );

  if (keyFiles.length !== 1 || !keyFiles[0]) {
    throw new Error("Expected exactly one public IndexNow ownership file.");
  }

  const keyFile = keyFiles[0];
  const key = keyFile.slice(0, -".txt".length);
  const contents = (await readFile(`public/${keyFile}`, "utf8")).trim();

  if (contents !== key) {
    throw new Error(
      "The IndexNow ownership file content must equal its filename.",
    );
  }

  return key;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push([...items.slice(index, index + size)]);
  }

  return chunks;
}

async function getChangedUrls(options: CliOptions): Promise<URL[]> {
  const { stdout } = await execFile(
    "git",
    [
      "diff",
      "--name-status",
      "--find-renames",
      options.baseRevision,
      options.headRevision,
    ],
    { encoding: "utf8" },
  );
  const changedPaths = parseChangedPaths(stdout);
  const urls = new Set<string>();

  for (const { beforePath, afterPath } of changedPaths) {
    if (beforePath && isBlogPath(beforePath)) {
      const source = await readGitFile(options.baseRevision, beforePath);
      const route = source ? blogRouteFromPath(beforePath, source) : undefined;
      if (route) {
        urls.add(route.href);
      }
    }

    if (afterPath && isBlogPath(afterPath)) {
      const source = await readGitFile(options.headRevision, afterPath);
      const route = source ? blogRouteFromPath(afterPath, source) : undefined;
      if (route) {
        urls.add(route.href);
      }
    }

    if (afterPath) {
      const route = pageRouteFromPath(afterPath);
      if (route) {
        urls.add(route.href);
      }
    }
  }

  if (needsSitemapRefresh(changedPaths)) {
    for (const url of await getSitemapUrls()) {
      urls.add(url.href);
    }
  }

  return [...urls].sort().map((url) => new URL(url));
}

async function submitUrls(urls: readonly URL[], key: string): Promise<void> {
  const keyLocation = new URL(`${key}.txt`, SITE_URL).href;

  for (const urlList of chunk(
    urls.map((url) => url.href),
    MAX_URLS_PER_REQUEST,
  )) {
    const payload: IndexNowPayload = {
      host: SITE_URL.host,
      key,
      keyLocation,
      urlList,
    };
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `IndexNow rejected URL submission with HTTP ${response.status}.`,
      );
    }
  }
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const urls = await getChangedUrls(options);

  if (urls.length === 0) {
    console.log("IndexNow: no public URLs changed.");
    return;
  }

  if (options.dryRun) {
    console.log(`IndexNow dry run: ${urls.length} URL(s) would be submitted.`);
    for (const url of urls) {
      console.log(url.href);
    }
    return;
  }

  const key = await getIndexNowKey();
  await submitUrls(urls, key);
  console.log(`IndexNow: submitted ${urls.length} URL(s).`);
}

void main().catch((error) => {
  const message =
    error instanceof Error ? error.message : "IndexNow submission failed.";
  console.error(message);
  process.exitCode = 1;
});
