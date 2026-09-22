// @vitest-environment happy-dom
// cspell:ignore emmc
import { afterEach, describe, expect, it } from "vitest";
import "@/lib/emmc-partitions";

afterEach(() => {
  document.body.innerHTML = "";
});

function demo() {
  const element = document.createElement("emmc-partitions");
  element.innerHTML =
    '<button data-region aria-pressed="true">User area</button><button data-region aria-pressed="false">RPMB</button><span data-device data-active>User device</span><span data-device>RPMB device</span><p data-description aria-hidden="false">Firmware and data</p><p data-description aria-hidden="true">Authenticated writes</p>';
  document.body.append(element);
  return {
    element,
    buttons: element.querySelectorAll<HTMLButtonElement>("button"),
    devices: element.querySelectorAll("[data-device]"),
    descriptions: element.querySelectorAll("[data-description]"),
  };
}

describe("eMMC selection", () => {
  it("highlights the matching device and retains its description after hover ends", () => {
    const view = demo();
    view.buttons[1]?.dispatchEvent(
      new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }),
    );
    expect(view.devices[0]?.hasAttribute("data-active")).toBe(false);
    expect(view.devices[1]?.hasAttribute("data-active")).toBe(true);
    expect(view.descriptions[1]?.getAttribute("aria-hidden")).toBe("false");
    view.element.dispatchEvent(new PointerEvent("pointerleave"));
    expect(view.descriptions[1]?.getAttribute("aria-hidden")).toBe("false");
  });
  it("supports keyboard focus and tap selection", () => {
    const view = demo();
    view.buttons[1]?.focus();
    expect(view.buttons[1]?.getAttribute("aria-pressed")).toBe("true");
    view.buttons[0]?.click();
    expect(view.descriptions[0]?.getAttribute("aria-hidden")).toBe("false");
    expect(view.descriptions[1]?.getAttribute("aria-hidden")).toBe("true");
  });
  it("isolates instances and cleans up listeners while preserving selection", () => {
    const first = demo();
    const second = demo();
    first.buttons[1]?.click();
    expect(second.buttons[0]?.getAttribute("aria-pressed")).toBe("true");
    first.element.remove();
    first.buttons[0]?.click();
    expect(first.buttons[1]?.getAttribute("aria-pressed")).toBe("true");
    document.body.append(first.element);
    first.buttons[0]?.click();
    expect(first.buttons[0]?.getAttribute("aria-pressed")).toBe("true");
  });
});
