import { describe, expect, it } from "vitest";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeExternalLinks from "rehype-external-links";
import { editorialLinks, pageMetadata } from "@/utils/seo.mjs";

describe("sitemap page metadata", () => {
  it("uses the rendered canonical URL and substantive update date", () => {
    expect(
      pageMetadata(`<html><head>
      <link href="https://techsquidtv.com/blog/example/" rel="canonical">
      <meta content="2026-08-01T00:00:00.000Z" property="article:published_time">
      <meta property="article:modified_time" content="2026-09-01T00:00:00.000Z">
    </head><body><meta name="robots" content="noindex"></body></html>`),
    ).toEqual({
      canonical: "https://techsquidtv.com/blog/example/",
      lastmod: "2026-09-01T00:00:00.000Z",
      noindex: false,
    });
  });

  it("uses the publication date when an article has never been updated", () => {
    expect(
      pageMetadata(
        '<head><meta property="article:published_time" content="2026-08-01T00:00:00Z"></head>',
      ).lastmod,
    ).toBe("2026-08-01T00:00:00.000Z");
  });

  it.each(["noindex", "NOINDEX, follow", "none"])(
    "recognizes robots exclusion %s",
    (robots) => {
      expect(
        pageMetadata(`<head><meta name="robots" content="${robots}"></head>`)
          .noindex,
      ).toBe(true);
    },
  );

  it("does not invent modification dates for ordinary pages", () => {
    expect(
      pageMetadata(
        '<head><meta name="robots" content="max-image-preview:large"></head>',
      ).lastmod,
    ).toBeUndefined();
  });
});

describe("editorial outbound links", () => {
  it("allows trusted citations while retaining explicitly qualified links", async () => {
    const result = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeExternalLinks, editorialLinks)
      .use(rehypeStringify)
      .process(
        '<a href="https://example.com/docs">Docs</a><a href="https://example.com/ad" rel="sponsored nofollow">Ad</a><a href="https://example.com/comment" rel="ugc nofollow">Comment</a>',
      );
    const html = result.toString();
    expect(html).toContain('href="https://example.com/docs" rel="noopener"');
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('rel="ugc nofollow noopener"');
  });
});
