interface TurnstileOptions {
  sitekey: string;
  action: string;
  appearance: "interaction-only";
  execution: "execute";
  theme: "auto";
  callback: (token: string) => void;
  "error-callback": () => void;
  "timeout-callback": () => void;
  "expired-callback": () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string | undefined;
  execute(widgetId: string): void;
  remove(widgetId: string): void;
}

let apiReady: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (apiReady) return apiReady;

  apiReady = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(fail, 15_000);
    function cleanUp(): void {
      window.clearTimeout(timer);
      document.removeEventListener("astro:before-swap", fail);
    }
    function fail(): void {
      cleanUp();
      script.remove();
      reject(new Error("Turnstile failed to load."));
    }
    function ready(): void {
      const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
      if (!api) return fail();
      // The load event guarantees the async script has executed. Turnstile's
      // ready() helper rejects APIs loaded with async or defer.
      cleanUp();
      resolve(api);
    }
    if ((window as Window & { turnstile?: TurnstileApi }).turnstile) {
      ready();
      return;
    }
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener("load", ready, { once: true });
    script.addEventListener("error", fail, { once: true });
    // Navigation removes head scripts. Let the next page retry immediately.
    document.addEventListener("astro:before-swap", fail, { once: true });
    document.head.append(script);
  }).catch((error: Error) => {
    apiReady = undefined;
    throw error;
  });
  return apiReady;
}

export async function verifyTurnstile(
  container: HTMLElement,
  signal: AbortSignal,
): Promise<string> {
  let api: TurnstileApi | undefined;
  let widgetId: string | undefined;
  let onAbort = () => {};
  try {
    return await new Promise<string>((resolve, reject) => {
      onAbort = () =>
        reject(new DOMException("Submission cancelled.", "AbortError"));
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
      void loadTurnstile()
        .then((loadedApi) => {
          if (signal.aborted) return;
          api = loadedApi;
          const sitekey = container.dataset.sitekey;
          const action = container.dataset.action;
          if (!sitekey || !action)
            throw new Error("Turnstile is not configured.");
          const onFailure = () =>
            reject(new Error("Turnstile verification failed."));
          widgetId = api.render(container, {
            sitekey,
            action,
            appearance: "interaction-only",
            execution: "execute",
            theme: "auto",
            callback: resolve,
            "error-callback": onFailure,
            "timeout-callback": onFailure,
            "expired-callback": onFailure,
          });
          if (!widgetId) throw new Error("Turnstile could not start.");
          api.execute(widgetId);
        })
        .catch(reject);
    });
  } finally {
    signal.removeEventListener("abort", onAbort);
    if (api && widgetId) api.remove(widgetId);
  }
}
