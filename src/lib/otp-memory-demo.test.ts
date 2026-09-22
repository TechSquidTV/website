// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/lib/otp-memory-demo";

beforeEach(() => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  vi.spyOn(window, "matchMedia").mockReturnValue({ ...media, matches: true });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function demo() {
  const element = document.createElement("otp-memory-demo");
  element.innerHTML = `<div class="otp-grid">${Array.from({ length: 128 }, (_, bit) => `<div role="gridcell"><button data-bit="${bit}" disabled tabindex="${bit === 0 ? 0 : -1}">/</button></div>`).join("")}</div>${Array.from({ length: 4 }, () => "<span data-key-group>00000000</span>").join("")}<span data-status></span><button data-provision disabled>Provision random key</button><button data-replace disabled>Replace SoC</button>`;
  document.body.append(element);
  const cells = Array.from(
    element.querySelectorAll<HTMLButtonElement>("[data-bit]"),
  );
  const click = (bit: number) => {
    const cell = cells[bit];
    if (!cell) throw new Error(`Missing bit ${bit}`);
    cell.click();
    return cell;
  };
  const key = () =>
    Array.from(
      element.querySelectorAll("[data-key-group]"),
      (group) => group.textContent,
    ).join("");
  const navigate = (bit: number, key: string) =>
    cells[bit]?.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  return { element, cells, click, key, navigate };
}

describe("OTP memory demo", () => {
  it("replaces a linked SoC with blank fuses and provisions only on request", () => {
    const random = vi
      .spyOn(crypto, "getRandomValues")
      .mockImplementation((array) => {
        if (!(array instanceof Uint8Array))
          throw new Error("Expected key bytes");
        array.fill(0x81);
        return array;
      });
    const view = demo();
    view.element.dataset.linked = "true";
    const provision =
      view.element.querySelector<HTMLButtonElement>("[data-provision]")!;
    provision.click();
    random.mockClear();
    view.element.querySelector<HTMLButtonElement>("[data-replace]")!.click();
    expect(random).not.toHaveBeenCalled();
    expect(view.key()).toBe("0".repeat(32));
    expect(view.cells.every((cell) => cell.textContent === "/")).toBe(true);
    expect(provision.disabled).toBe(false);
    provision.click();
    expect(random).toHaveBeenCalledTimes(1);
    expect(view.key()).toBe("81".repeat(16));
  });

  it("slides the same grid out and in, locks interaction, and cancels on removal", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: false,
    });
    const view = demo();
    const grid = view.element.querySelector<HTMLElement>(".otp-grid")!;
    const animations: Animation[] = [];
    grid.animate = vi.fn(() => {
      const animation = new Animation();
      vi.spyOn(animation, "cancel").mockImplementation(() => {});
      animations.push(animation);
      return animation;
    });
    const finish = (index: number) => {
      const animation = animations[index]!;
      animation.onfinish?.call(
        animation,
        new Event("finish") as AnimationPlaybackEvent,
      );
    };
    const replace =
      view.element.querySelector<HTMLButtonElement>("[data-replace]")!;
    view.click(0);
    replace.click();
    expect(replace.disabled).toBe(true);
    view.click(1);
    expect(view.key()).toBe("8" + "0".repeat(31));
    finish(0);
    expect(view.key()).toBe("0".repeat(32));
    expect(view.element.querySelectorAll(".otp-grid")).toHaveLength(1);
    expect(view.element.querySelector(".otp-grid")).toBe(grid);
    finish(1);
    expect(replace.disabled).toBe(false);
    expect(view.element.hasAttribute("aria-busy")).toBe(false);
    replace.click();
    view.element.remove();
    expect(animations[2]?.cancel).toHaveBeenCalled();
    expect(animations[2]?.onfinish).toBeNull();
    document.body.append(view.element);
    expect(replace.disabled).toBe(false);
    expect(view.element.hasAttribute("data-replacing")).toBe(false);
  });

  it("animates one-way burns and cancels pending work on replacement or removal", () => {
    vi.useFakeTimers();
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: false,
    });
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      if (!(array instanceof Uint8Array)) throw new Error("Expected key bytes");
      array.fill(255);
      return array;
    });
    const view = demo();
    const provision =
      view.element.querySelector<HTMLButtonElement>("[data-provision]")!;
    const replace =
      view.element.querySelector<HTMLButtonElement>("[data-replace]")!;
    provision.click();
    expect(view.element.getAttribute("aria-busy")).toBe("true");
    expect(view.key()).not.toBe("F".repeat(32));
    const initial = view.key();
    view.click(127);
    expect(view.key()).toBe(initial);
    vi.advanceTimersByTime(700);
    expect(view.key()).toBe("F".repeat(32));
    expect(view.element.hasAttribute("aria-busy")).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: true,
    });
    replace.click();
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: false,
    });
    provision.click();
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: true,
    });
    replace.click();
    vi.runAllTimers();
    expect(view.key()).toBe("0".repeat(32));
    vi.mocked(window.matchMedia).mockReturnValue({
      ...window.matchMedia(""),
      matches: false,
    });
    provision.click();
    const partial = view.key();
    view.element.remove();
    vi.runAllTimers();
    expect(view.key()).toBe(partial);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("highlights mouse hover once per cell and clears on exit or disconnect", () => {
    const view = demo();
    const grid = view.element.querySelector<HTMLElement>(".otp-grid")!;
    const cell = view.cells[17]!;
    const setProperty = vi.spyOn(grid.style, "setProperty");
    const hover = (pointerType: string) =>
      cell.dispatchEvent(
        new PointerEvent("pointerover", { bubbles: true, pointerType }),
      );
    hover("touch");
    expect(grid.hasAttribute("data-hover")).toBe(false);
    hover("mouse");
    expect(grid.style.getPropertyValue("--hover-row")).toBe("1");
    expect(grid.style.getPropertyValue("--hover-column")).toBe("1");
    expect(grid.hasAttribute("data-hover")).toBe(true);
    setProperty.mockClear();
    hover("mouse");
    expect(setProperty).not.toHaveBeenCalled();
    grid.dispatchEvent(new PointerEvent("pointerleave"));
    expect(grid.hasAttribute("data-hover")).toBe(false);
    hover("mouse");
    expect(grid.hasAttribute("data-hover")).toBe(true);
    view.element.remove();
    expect(grid.hasAttribute("data-hover")).toBe(false);
    document.body.append(view.element);
    hover("mouse");
    expect(grid.hasAttribute("data-hover")).toBe(true);
  });

  it("provisions random bytes once and requires a fresh SoC", () => {
    const random = vi
      .spyOn(crypto, "getRandomValues")
      .mockImplementation((array) => {
        if (!(array instanceof Uint8Array))
          throw new Error("Expected key bytes");
        array.fill(0x81);
        return array;
      });
    const view = demo();
    const provision =
      view.element.querySelector<HTMLButtonElement>("[data-provision]")!;
    const replace =
      view.element.querySelector<HTMLButtonElement>("[data-replace]")!;
    provision.click();
    expect(view.key()).toBe("81".repeat(16));
    expect(view.cells.filter((cell) => cell.textContent === "")).toHaveLength(
      32,
    );
    expect(provision.disabled).toBe(true);
    provision.click();
    expect(random).toHaveBeenCalledTimes(1);
    view.element.remove();
    document.body.append(view.element);
    expect(provision.disabled).toBe(true);
    replace.click();
    expect(provision.disabled).toBe(false);
    view.click(1);
    expect(provision.disabled).toBe(true);
    provision.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(random).toHaveBeenCalledTimes(1);
    expect(view.key()).toBe("4" + "0".repeat(31));
    replace.click();
    provision.click();
    expect(random).toHaveBeenCalledTimes(2);
    expect(view.key()).toBe("81".repeat(16));
  });

  it("maps the first, last, and byte-boundary bits most significant first", () => {
    const view = demo();
    expect(view.key()).toBe("0".repeat(32));
    for (const bit of [0, 7, 8, 31, 32, 127]) view.click(bit);
    expect(view.key()).toBe("81800001800000000000000000000001");
    expect(view.cells.filter((cell) => cell.textContent === "")).toHaveLength(
      6,
    );
  });

  it("burns only once, permits inspection, and replaces an exhausted SoC", () => {
    const view = demo();
    const cell = view.click(0);
    view.click(0);
    expect(cell.textContent).toBe("");
    expect(cell.disabled).toBe(false);
    expect(cell.getAttribute("aria-disabled")).toBe("true");
    expect(view.cells.filter((cell) => cell.textContent === "")).toHaveLength(
      1,
    );
    for (let bit = 0; bit < 128; bit++) view.click(bit);
    expect(view.key()).toBe("F".repeat(32));
    view.element.querySelector<HTMLButtonElement>("[data-replace]")?.click();
    expect(view.key()).toBe("0".repeat(32));
    expect(
      view.cells.every(
        (button) =>
          button.textContent === "/" &&
          button.getAttribute("aria-disabled") === "false",
      ),
    ).toBe(true);
    expect(view.cells.filter((cell) => cell.textContent === "")).toHaveLength(
      0,
    );
    view.click(127);
    expect(view.key()).toBe("0".repeat(31) + "1");
  });

  it("navigates rows without wrapping and keeps one tab stop", () => {
    const view = demo();
    view.navigate(0, "ArrowRight");
    expect(document.activeElement).toBe(view.cells[1]);
    view.navigate(1, "ArrowUp");
    expect(document.activeElement).toBe(view.cells[1]);
    view.navigate(1, "ArrowDown");
    expect(document.activeElement).toBe(view.cells[17]);
    view.navigate(17, "Home");
    expect(document.activeElement).toBe(view.cells[16]);
    view.navigate(16, "ArrowLeft");
    expect(document.activeElement).toBe(view.cells[16]);
    view.navigate(16, "End");
    expect(document.activeElement).toBe(view.cells[31]);
    expect(view.cells.filter((cell) => cell.tabIndex === 0)).toHaveLength(1);
  });

  it("isolates instances and cleans up listeners across disconnects", () => {
    const first = demo();
    const second = demo();
    first.click(0);
    expect(second.key()).toBe("0".repeat(32));
    first.element.remove();
    first.click(1);
    expect(first.key()).toBe("8" + "0".repeat(31));
    document.body.append(first.element);
    first.click(1);
    expect(first.key()).toBe("C" + "0".repeat(31));
    expect(first.cells.filter((cell) => cell.textContent === "")).toHaveLength(
      2,
    );
  });
});
