class OTPMemoryDemo extends HTMLElement {
  private readonly key = new Uint8Array(16);
  private cells: HTMLButtonElement[] = [];
  private groups: HTMLElement[] = [];
  private status: HTMLElement | null = null;
  private controller: AbortController | null = null;
  private burned = 0;
  private activeBit = 0;
  private provisioned = false;
  private replacing = false;
  private slide: Animation | null = null;
  private animationTimer: number | null = null;
  private pendingBits: number[] = [];
  private provisionButton: HTMLButtonElement | null = null;

  private get busy(): boolean {
    return this.replacing || this.pendingBits.length > 0;
  }
  private get linked(): boolean {
    return this.dataset.linked === "true";
  }

  connectedCallback(): void {
    if (this.controller) return;
    this.cells = Array.from(
      this.querySelectorAll<HTMLButtonElement>("[data-bit]"),
    );
    this.status = this.querySelector("[data-status]");
    this.groups = Array.from(
      this.querySelectorAll<HTMLElement>("[data-key-group]"),
    );
    this.provisionButton = this.querySelector("[data-provision]");
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.addEventListener("click", this.onClick, { signal });
    this.addEventListener("keydown", this.onKeyDown, { signal });
    const grid = this.querySelector<HTMLElement>(".otp-grid");
    if (grid) {
      let hoveredBit = -1;
      grid.addEventListener(
        "pointerover",
        (event) => {
          if (
            this.replacing ||
            event.pointerType === "touch" ||
            !(event.target instanceof Element)
          )
            return;
          const cell = event.target.closest('[role="gridcell"]');
          const button = cell?.querySelector<HTMLButtonElement>("[data-bit]");
          const bit = button ? this.getBit(button) : -1;
          if (bit < 0 || bit === hoveredBit) return;
          hoveredBit = bit;
          grid.style.setProperty("--hover-row", String(Math.floor(bit / 16)));
          grid.style.setProperty("--hover-column", String(bit % 16));
          grid.dataset.hover = "";
        },
        { signal },
      );
      const clearHover = () => {
        hoveredBit = -1;
        delete grid.dataset.hover;
      };
      grid.addEventListener("pointerleave", clearHover, { signal });
      grid.addEventListener("pointercancel", clearHover, { signal });
      signal.addEventListener("abort", clearHover, { once: true });
    }
    this.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      button.disabled = false;
    });
    this.updateProvisionButton();
  }

  disconnectedCallback(): void {
    this.stopAnimation();
    this.finishReplacement();
    this.controller?.abort();
    this.controller = null;
  }

  private readonly onClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button");
    if (!(button instanceof HTMLButtonElement) || !this.contains(button))
      return;
    if (this.replacing) return;
    if (button.hasAttribute("data-replace")) {
      this.replaceSoC();
      return;
    }
    if (button.hasAttribute("data-provision")) {
      if ((!this.linked && this.burned > 0) || this.provisioned) return;
      if (this.linked && this.burned > 0) {
        this.provisioned = true;
        this.updateStatus("Using the programmed HUK to provision this device.");
        return;
      }
      const randomKey = crypto.getRandomValues(new Uint8Array(16));
      this.provisioned = true;
      this.pendingBits = this.cells.flatMap((_, bit) =>
        ((randomKey[Math.floor(bit / 8)] ?? 0) & (1 << (7 - (bit % 8)))) !== 0
          ? [bit]
          : [],
      );
      // Shuffle only the reveal order; key material comes from Web Crypto.
      for (let i = this.pendingBits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const left = this.pendingBits[i];
        const right = this.pendingBits[j];
        if (left !== undefined && right !== undefined) {
          this.pendingBits[i] = right;
          this.pendingBits[j] = left;
        }
      }
      const batchSize = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? this.pendingBits.length
        : Math.max(1, Math.ceil(this.pendingBits.length / 20));
      this.setAttribute("aria-busy", "true");
      this.cells.forEach((cell) => cell.setAttribute("aria-disabled", "true"));
      if (this.provisionButton)
        this.provisionButton.textContent = "Provisioning…";
      this.updateStatus(
        this.linked
          ? "Programming hardware unique key."
          : "Provisioning random AES-128 key.",
      );
      const reveal = () => {
        this.animationTimer = null;
        const groups = new Set<number>();
        for (const bit of this.pendingBits.splice(0, batchSize)) {
          if (this.burnBit(bit)) groups.add(Math.floor(bit / 32));
        }
        groups.forEach((group) => this.renderGroup(group));
        if (this.pendingBits.length > 0) {
          this.animationTimer = window.setTimeout(reveal, 35);
        } else {
          this.stopAnimation();
          this.updateStatus(
            `${this.linked ? "Hardware unique key" : "Random AES-128 key"} provisioned. ${this.burned} of 128 fuses burned.`,
          );
        }
      };
      reveal();
      return;
    }
    if (this.pendingBits.length > 0) return;
    const bit = this.getBit(button);
    if (bit < 0) return;
    this.setActiveBit(bit);
    if (!this.burnBit(bit)) return;
    this.renderGroup(Math.floor(bit / 32));
    this.updateStatus(
      `Bit ${bit} burned to 1. ${this.burned} of 128 fuses burned.`,
    );
  };

  private replaceSoC(): void {
    this.stopAnimation();
    const grid = this.querySelector<HTMLElement>(".otp-grid");
    const reset = () => {
      this.key.fill(0);
      this.burned = 0;
      this.provisioned = false;
      this.renderMemory();
      this.updateStatus(
        this.linked
          ? "Demo restarted. All 128 wires are intact."
          : "New SoC installed. All 128 wires are intact.",
      );
    };
    if (
      !grid ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      reset();
      return;
    }
    this.replacing = true;
    this.dataset.replacing = "";
    this.setAttribute("aria-busy", "true");
    delete grid.dataset.hover;
    this.updateProvisionButton();
    const replaceButton =
      this.querySelector<HTMLButtonElement>("[data-replace]");
    if (replaceButton) replaceButton.disabled = true;
    this.cells.forEach((cell) => cell.setAttribute("aria-disabled", "true"));
    this.slide = grid.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
      {
        duration: 420,
        easing: "cubic-bezier(0.4, 0, 0.7, 1)",
        fill: "forwards",
      },
    );
    this.slide.onfinish = () => {
      reset();
      this.cells.forEach((cell) => cell.setAttribute("aria-disabled", "true"));
      this.slide?.cancel();
      this.slide = grid.animate(
        [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
        {
          duration: 620,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        },
      );
      this.slide.onfinish = () => this.finishReplacement();
    };
  }

  private finishReplacement(): void {
    if (this.slide) {
      this.slide.onfinish = null;
      this.slide.cancel();
      this.slide = null;
    }
    if (!this.replacing) return;
    this.replacing = false;
    delete this.dataset.replacing;
    this.removeAttribute("aria-busy");
    const replaceButton =
      this.querySelector<HTMLButtonElement>("[data-replace]");
    if (replaceButton) replaceButton.disabled = false;
    this.updateProvisionButton();
    this.cells.forEach((cell, bit) => this.renderCell(cell, bit));
  }

  private burnBit(bit: number): boolean {
    const byte = Math.floor(bit / 8);
    const mask = 1 << (7 - (bit % 8));
    const value = this.key[byte];
    const cell = this.cells[bit];
    if (value === undefined || !cell || (value & mask) !== 0) return false;
    this.key[byte] = value | mask;
    this.burned++;
    this.renderCell(cell, bit);
    return true;
  }

  private stopAnimation(): void {
    if (this.animationTimer !== null) window.clearTimeout(this.animationTimer);
    this.animationTimer = null;
    this.pendingBits = [];
    this.removeAttribute("aria-busy");
    if (this.provisionButton)
      this.provisionButton.textContent =
        this.dataset.provisionLabel ?? "Provision random key";
    this.cells.forEach((cell, bit) => this.renderCell(cell, bit));
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.replacing) return;
    if (!(event.target instanceof HTMLButtonElement)) return;
    const bit = this.getBit(event.target);
    if (bit < 0) return;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = bit % 16 > 0 ? bit - 1 : bit;
        break;
      case "ArrowRight":
        next = bit % 16 < 15 ? bit + 1 : bit;
        break;
      case "ArrowUp":
        next = bit >= 16 ? bit - 16 : bit;
        break;
      case "ArrowDown":
        next = bit < 112 ? bit + 16 : bit;
        break;
      case "Home":
        next = event.ctrlKey ? 0 : bit - (bit % 16);
        break;
      case "End":
        next = event.ctrlKey ? 127 : bit - (bit % 16) + 15;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setActiveBit(next);
    this.cells[next]?.focus();
  };

  private getBit(button: HTMLButtonElement): number {
    const bit = Number(button.dataset.bit);
    return Number.isInteger(bit) && this.cells[bit] === button ? bit : -1;
  }

  private setActiveBit(bit: number): void {
    if (bit === this.activeBit) return;
    const previous = this.cells[this.activeBit];
    const next = this.cells[bit];
    if (previous) previous.tabIndex = -1;
    if (next) next.tabIndex = 0;
    this.activeBit = bit;
  }

  private renderCell(cell: HTMLButtonElement, bit: number): void {
    const burned =
      ((this.key[Math.floor(bit / 8)] ?? 0) & (1 << (7 - (bit % 8)))) !== 0;
    cell.textContent = burned ? "" : "/";
    cell.setAttribute("aria-disabled", String(burned || this.busy));
    cell.setAttribute(
      "aria-label",
      `Bit ${bit}, row ${Math.floor(bit / 16) + 1}, column ${(bit % 16) + 1}: ${burned ? "burned, 1. Cannot be restored." : "intact, 0. Burn fuse."}`,
    );
  }

  private renderMemory(): void {
    this.cells.forEach((cell, bit) => this.renderCell(cell, bit));
    this.groups.forEach((_, group) => this.renderGroup(group));
  }

  private renderGroup(group: number): void {
    const output = this.groups[group];
    if (output)
      output.textContent = Array.from(
        this.key.subarray(group * 4, group * 4 + 4),
        (byte) => byte.toString(16).padStart(2, "0"),
      )
        .join("")
        .toUpperCase();
  }

  private updateProvisionButton(): void {
    if (this.provisionButton) {
      this.provisionButton.disabled =
        this.replacing || (!this.linked && this.burned > 0) || this.provisioned;
    }
  }

  private updateStatus(message: string): void {
    this.updateProvisionButton();
    if (this.status) this.status.textContent = message;
  }
}

if (!customElements.get("otp-memory-demo")) {
  customElements.define("otp-memory-demo", OTPMemoryDemo);
}
