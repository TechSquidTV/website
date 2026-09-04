const OPS_HOSTNAME = "ops.techsquidtv.com";
const NOINDEX_VALUE = "noindex, nofollow, noarchive, nosnippet";
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);

type OpsPage = {
  html: string;
  path: "/backrest" | "/backrest/privacy";
};

const pageShell = (
  path: OpsPage["path"],
  title: string,
  description: string,
  content: string,
) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="${NOINDEX_VALUE}" />
    <meta name="description" content="${description}" />
    <link rel="canonical" href="https://${OPS_HOSTNAME}${path}" />
    <title>${title}</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { background: Canvas; color: CanvasText; line-height: 1.6; margin: 0; }
      main { box-sizing: border-box; margin: 0 auto; max-width: 48rem; padding: 4rem 1.5rem; }
      h1, h2 { line-height: 1.2; }
      h1 { font-size: clamp(2rem, 8vw, 3rem); margin: 0 0 1rem; }
      h2 { font-size: 1.25rem; margin-top: 2rem; }
      p, li { max-width: 72ch; }
      a { color: LinkText; }
      .eyebrow { font-size: .8rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .revision { color: GrayText; font-size: .9rem; margin-top: 3rem; }
    </style>
  </head>
  <body>
    <main>${content}</main>
  </body>
</html>`;

const createPage = (
  path: OpsPage["path"],
  title: string,
  description: string,
  content: string,
): OpsPage => ({
  path,
  html: pageShell(path, title, description, content),
});

const pages: Record<OpsPage["path"], OpsPage> = {
  "/backrest": createPage(
    "/backrest",
    "RackServer Backup",
    "Public information about RackServer Backup and its limited Google Drive access.",
    `<p class="eyebrow">Google Drive Integration</p>
      <h1>RackServer Backup</h1>
      <p>RackServer Backup uses Google Drive to store encrypted backup files created by the application.</p>
      <h2>How Google Drive is used</h2>
      <p>The application requests access only to the Google Drive files it creates for this purpose. It does not browse, index, or provide access to other files in a user's Google Drive.</p>
      <h2>Privacy</h2>
      <p>Google user data is used only to provide this backup function. It is not sold, shared with third parties, used for advertising, or used to develop, improve, or train artificial-intelligence or machine-learning models.</p>
      <p><a href="/backrest/privacy">Read the RackServer Backup privacy policy</a>.</p>`,
  ),
  "/backrest/privacy": createPage(
    "/backrest/privacy",
    "RackServer Backup Privacy Policy",
    "Privacy policy for RackServer Backup's limited Google Drive integration.",
    `<p class="eyebrow">Google Drive Integration</p>
      <h1>RackServer Backup Privacy Policy</h1>
      <h2>Google Drive data</h2>
      <p>RackServer Backup uses Google Drive solely to create and store encrypted backup files. It requests access only to the Google Drive files created by the application and does not browse, index, or access other files in a user's Google Drive.</p>
      <h2>Use of Google user data</h2>
      <p>Google user data is used only to provide the backup function described above. It is not used for advertising, sold, rented, or transferred to third parties. It is not used to develop, improve, or train generalized artificial-intelligence or machine-learning models.</p>
      <h2>Public website</h2>
      <p>This website is informational only. It does not provide forms or another mechanism for visitors to submit personal information, and it does not provide access to Google Drive files.</p>
      <h2>Contact</h2>
      <p>For questions about this policy, contact <a href="mailto:contact@techsquidtv.com">contact@techsquidtv.com</a>.</p>
      <p class="revision">Last revised: September 4, 2026</p>
      <p><a href="/backrest">Back to RackServer Backup</a>.</p>`,
  ),
};

function securityHeaders(contentType: string): Headers {
  return new Headers({
    "cache-control": "public, max-age=300",
    "content-security-policy":
      "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "content-type": contentType,
    "permissions-policy":
      "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-robots-tag": NOINDEX_VALUE,
  });
}

function textResponse(
  status: number,
  body: string,
  headers?: Headers,
): Response {
  return new Response(body, {
    status,
    headers: headers ?? securityHeaders("text/plain; charset=UTF-8"),
  });
}

export function handleOpsRequest(request: Request): Response {
  const url = new URL(request.url);

  if (url.hostname !== OPS_HOSTNAME) {
    return textResponse(404, "not found");
  }

  const canonicalPath = url.pathname.endsWith("/")
    ? url.pathname.slice(0, -1)
    : url.pathname;
  const page = pages[canonicalPath as OpsPage["path"]];

  if (!page) {
    return textResponse(404, "not found");
  }

  if (!ALLOWED_METHODS.has(request.method)) {
    const headers = securityHeaders("text/plain; charset=UTF-8");
    headers.set("allow", "GET, HEAD");
    return textResponse(405, "method not allowed", headers);
  }

  if (url.pathname !== page.path || url.search) {
    return Response.redirect(`https://${OPS_HOSTNAME}${page.path}`, 308);
  }

  const headers = securityHeaders("text/html; charset=UTF-8");
  return new Response(request.method === "HEAD" ? null : page.html, {
    status: 200,
    headers,
  });
}

export default {
  fetch(request: Request): Response {
    return handleOpsRequest(request);
  },
};
