// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Turnstile lifecycle", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    document.dispatchEvent(new Event("astro:before-swap"));
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  function container(): HTMLDivElement {
    const element = document.createElement("div");
    element.dataset.sitekey = "test-key";
    element.dataset.action = "newsletter";
    document.body.append(element);
    return element;
  }

  it.each(["preloaded", "script"])(
    "verifies across pages with a %s API without calling ready",
    async (loading) => {
      const scripts: HTMLScriptElement[] = [];
      vi.spyOn(document.head, "append").mockImplementation((...nodes) => {
        for (const node of nodes) {
          if (node instanceof HTMLScriptElement) scripts.push(node);
        }
      });
      let success: (token: string) => void = () => {};
      const render = vi.fn(
        (
          _element: HTMLElement,
          options: { callback: (token: string) => void },
        ) => {
          success = options.callback;
          return `widget-${render.mock.calls.length}`;
        },
      );
      const remove = vi.fn();
      const ready = vi.fn(() => {
        throw new Error("Turnstile ready does not support async scripts.");
      });
      const api = {
        ready,
        render,
        execute: () => success("token"),
        remove,
      };
      if (loading === "preloaded") vi.stubGlobal("turnstile", api);
      const { verifyTurnstile } = await import("@/lib/turnstile-client");
      for (let page = 0; page < 2; page++) {
        const controller = new AbortController();
        const verification = verifyTurnstile(container(), controller.signal);
        const completed = expect(verification).resolves.toBe("token");
        try {
          if (loading === "script" && page === 0) {
            expect(render).not.toHaveBeenCalled();
            expect(scripts[0]?.async).toBe(true);
            expect(scripts[0]?.src).toContain("render=explicit");
            vi.stubGlobal("turnstile", api);
            scripts[0]?.dispatchEvent(new Event("load"));
          }
          await completed;
        } finally {
          controller.abort();
          await completed.catch(() => {});
        }
        document.dispatchEvent(new Event("astro:before-swap"));
        document.body.innerHTML = "";
      }
      expect(render).toHaveBeenCalledTimes(2);
      expect(ready).not.toHaveBeenCalled();
      expect(scripts).toHaveLength(loading === "script" ? 1 : 0);
      expect(remove.mock.calls).toEqual([["widget-1"], ["widget-2"]]);
    },
  );

  it("removes a pending widget when cancelled", async () => {
    const remove = vi.fn();
    vi.stubGlobal("turnstile", {
      render: () => "widget",
      execute: vi.fn(),
      remove,
    });
    const { verifyTurnstile } = await import("@/lib/turnstile-client");
    const controller = new AbortController();
    const promise = verifyTurnstile(container(), controller.signal);
    const rejected = expect(promise).rejects.toMatchObject({
      name: "AbortError",
    });
    await Promise.resolve();
    await Promise.resolve();
    controller.abort();
    await rejected;
    expect(remove).toHaveBeenCalledWith("widget");
  });

  it.each(["error", "navigation"])(
    "allows retrying after loading is interrupted by %s",
    async (reason) => {
      const scripts: HTMLScriptElement[] = [];
      vi.spyOn(document.head, "append").mockImplementation((...nodes) => {
        for (const node of nodes) {
          if (node instanceof HTMLScriptElement) scripts.push(node);
        }
      });
      const { verifyTurnstile } = await import("@/lib/turnstile-client");
      const first = verifyTurnstile(container(), new AbortController().signal);
      const failure = expect(first).rejects.toThrow(
        "Turnstile failed to load.",
      );
      if (reason === "error") {
        scripts[0]?.dispatchEvent(new Event("error"));
      } else {
        document.dispatchEvent(new Event("astro:before-swap"));
      }
      await failure;
      const controller = new AbortController();
      const retry = verifyTurnstile(container(), controller.signal);
      const cancelled = expect(retry).rejects.toMatchObject({
        name: "AbortError",
      });
      expect(scripts[1]?.src).toContain("render=explicit");
      controller.abort();
      await cancelled;
      scripts[1]?.dispatchEvent(new Event("error"));
    },
  );
});
