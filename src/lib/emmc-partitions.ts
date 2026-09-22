// cspell:ignore emmc
class EMMCPartitions extends HTMLElement {
  private controller: AbortController | null = null;

  connectedCallback(): void {
    if (this.controller) return;
    this.controller = new AbortController();
    const { signal } = this.controller;
    const buttons = Array.from(
      this.querySelectorAll<HTMLButtonElement>("[data-region]"),
    );
    const devices = this.querySelectorAll<HTMLElement>("[data-device]");
    const descriptions =
      this.querySelectorAll<HTMLElement>("[data-description]");
    let active = buttons.findIndex(
      (button) => button.getAttribute("aria-pressed") === "true",
    );
    const select = (event: Event) => {
      if (event instanceof PointerEvent && event.pointerType === "touch")
        return;
      const button =
        event.target instanceof Element
          ? event.target.closest("[data-region]")
          : null;
      if (!(button instanceof HTMLButtonElement)) return;
      const index = buttons.indexOf(button);
      if (index < 0 || index === active) return;
      buttons[active]?.setAttribute("aria-pressed", "false");
      devices[active]?.removeAttribute("data-active");
      descriptions[active]?.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-pressed", "true");
      devices[index]?.setAttribute("data-active", "");
      descriptions[index]?.setAttribute("aria-hidden", "false");
      active = index;
    };
    this.addEventListener("pointerover", select, { signal });
    this.addEventListener("focusin", select, { signal });
    this.addEventListener("click", select, { signal });
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }
}

if (!customElements.get("emmc-partitions")) {
  customElements.define("emmc-partitions", EMMCPartitions);
}
