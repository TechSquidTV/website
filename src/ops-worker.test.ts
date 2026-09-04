import { describe, expect, it } from "vitest";
import { handleOpsRequest } from "@/ops-worker";

const request = (path: string, init?: RequestInit) =>
  new Request(`https://ops.techsquidtv.com${path}`, init);

describe("ops worker", () => {
  it("serves the RackServer Backup page with restrictive headers", async () => {
    const response = handleOpsRequest(request("/backrest"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'none'",
    );
    await expect(response.text()).resolves.toContain("RackServer Backup");
  });

  it("serves the privacy policy", async () => {
    const response = handleOpsRequest(request("/backrest/privacy"));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain(
      "RackServer Backup Privacy Policy",
    );
  });

  it("redirects trailing slash and query variants to canonical routes", () => {
    const response = handleOpsRequest(request("/backrest/?source=oauth"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://ops.techsquidtv.com/backrest",
    );
  });

  it("rejects non-public paths and application routes", () => {
    for (const path of ["/", "/api/forms/contact", "/_astro/site.js"]) {
      expect(handleOpsRequest(request(path)).status).toBe(404);
    }
  });

  it("accepts HEAD but rejects state-changing methods", async () => {
    const head = handleOpsRequest(request("/backrest", { method: "HEAD" }));
    const post = handleOpsRequest(request("/backrest", { method: "POST" }));

    expect(head.status).toBe(200);
    await expect(head.text()).resolves.toBe("");
    expect(post.status).toBe(405);
    expect(post.headers.get("allow")).toBe("GET, HEAD");
  });
});
