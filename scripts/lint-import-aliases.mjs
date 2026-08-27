import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.join(repositoryRoot, "src");
const lintedExtensions = new Set([
  ".astro",
  ".cjs",
  ".cts",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".mdx",
  ".ts",
  ".tsx",
]);
const sourceSpecifierPatterns = [
  /\b(?:from\s*|import\s*(?:\(\s*)?)(["'])(\.{1,2}\/[^"']+)\1/g,
  /\brequire\s*\(\s*(["'])(\.{1,2}\/[^"']+)\1/g,
  /@import\s+url\(\s*(["'])(\.{1,2}\/[^"']+)\1/g,
];
const hardcodedColorPattern =
  /(?<!&)#[\da-f]{3,8}\b|\b(?:hsl|hsla|oklch|rgb|rgba)\s*\(/giu;
const themeTokenFiles = new Set([
  "src/consts.ts",
  "src/emails/theme.ts",
  "src/lib/open-graph-theme.ts",
  "src/styles/global.css",
]);

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(filePath);
    }

    return lintedExtensions.has(path.extname(entry.name)) ? [filePath] : [];
  });
}

function maskMdxCodeFences(source) {
  return source.replace(/```[\s\S]*?```/g, (codeFence) =>
    codeFence.replace(/[^\n]/g, " "),
  );
}

function findRelativeSpecifiers(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const lintableSource =
    path.extname(filePath) === ".mdx" ? maskMdxCodeFences(source) : source;
  const findings = [];
  const offsets = new Set();

  for (const pattern of sourceSpecifierPatterns) {
    for (const match of lintableSource.matchAll(pattern)) {
      const [fullMatch, , specifier] = match;
      const offset = match.index + fullMatch.lastIndexOf(specifier);

      if (offsets.has(offset)) {
        continue;
      }

      offsets.add(offset);
      const line = source.slice(0, offset).split("\n").length;
      findings.push({ line, specifier });
    }
  }

  return findings;
}

function findHardcodedColors(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const lintableSource =
    path.extname(filePath) === ".mdx" ? maskMdxCodeFences(source) : source;
  const findings = [];

  for (const match of lintableSource.matchAll(hardcodedColorPattern)) {
    const color = match[0];
    const line = source.slice(0, match.index).split("\n").length;
    findings.push({ color, line });
  }

  return findings;
}

const files = [
  ...collectFiles(sourceRoot),
  path.join(repositoryRoot, "astro.config.mjs"),
  path.join(repositoryRoot, "vitest.config.mjs"),
];
const violations = files.flatMap((filePath) =>
  findRelativeSpecifiers(filePath).map(
    ({ line, specifier }) =>
      `${path.relative(repositoryRoot, filePath)}:${line}: Relative import "${specifier}" is forbidden. Use @/ for src modules or #utils/ in Astro config.`,
  ),
);

for (const filePath of files) {
  const relativePath = path.relative(repositoryRoot, filePath);
  if (themeTokenFiles.has(relativePath)) {
    continue;
  }

  for (const { color, line } of findHardcodedColors(filePath)) {
    violations.push(
      `${relativePath}:${line}: Hard-coded color "${color}" is forbidden. Use a CSS theme token or a named central theme value.`,
    );
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
}
