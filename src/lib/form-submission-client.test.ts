// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { verify } = vi.hoisted(() => ({
  verify:
    vi.fn<(container: HTMLElement, signal: AbortSignal) => Promise<string>>(),
}));
vi.mock("@/lib/turnstile-client", () => ({ verifyTurnstile: verify }));
vi.mock("@/lib/sentry-client-metrics", () => ({
  clearNewsletterAttribution: vi.fn(),
  newsletterAttributionForForm: () => ({
    contentTopic: "other",
    placement: "other",
  }),
  trackClientFormFailure: vi.fn(),
  trackNewsletterSubscribeStarted: vi.fn(),
}));
import "@/lib/form-submission-client";

function visit(kind: "contact" | "newsletter"): HTMLFormElement {
  document.dispatchEvent(new Event("astro:before-swap"));
  document.body.innerHTML = `
    <form data-form-endpoint="/api/forms/${kind}" data-form-kind="${kind}" data-form-dialog="result">
      <input name="email" value="reader@example.com"><input name="name" value="Reader">
      <textarea name="message">Hello</textarea><button type="submit">Send</button><p data-form-status></p>
    </form>
    <dialog id="result"><h2 data-form-dialog-title></h2><p data-form-dialog-message></p>
      <div data-form-dialog-challenge><div data-turnstile></div></div>
      <button data-form-dialog-cancel>Cancel</button><button data-form-dialog-close>Close</button>
    </dialog>`;
  document.dispatchEvent(new Event("astro:page-load"));
  const form = document.querySelector("form");
  if (!form) throw new Error("Missing form fixture.");
  return form;
}

describe("form navigation", () => {
  beforeEach(() => {
    verify.mockReset().mockResolvedValue("test-token");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () => Response.json({ message: "Thanks!" })),
    );
  });
  afterEach(() => {
    document.dispatchEvent(new Event("astro:before-swap"));
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("submits contact, newsletter, and a revisited contact page without duplicate handlers", async () => {
    for (const kind of ["contact", "newsletter", "contact"] as const) {
      const form = visit(kind);
      document.dispatchEvent(new Event("astro:page-load"));
      const event = new Event("submit", { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await vi.waitFor(() =>
        expect(form.querySelector("[data-form-status]")?.textContent).toBe(
          "Thanks!",
        ),
      );
      expect(fetch).toHaveBeenLastCalledWith(
        `/api/forms/${kind}`,
        expect.objectContaining({ method: "POST" }),
      );
    }
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(verify).toHaveBeenCalledTimes(3);
  });

  it("aborts verification on navigation and does not submit the abandoned form", async () => {
    verify.mockImplementation(
      (_container: HTMLElement, signal: AbortSignal) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Cancelled", "AbortError")),
            { once: true },
          );
        }),
    );
    visit("contact").dispatchEvent(new Event("submit", { cancelable: true }));
    visit("newsletter");
    await vi.waitFor(() =>
      expect(verify.mock.calls[0]?.[1].aborted).toBe(true),
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(document.querySelector("dialog")?.open).toBe(false);
  });
});
