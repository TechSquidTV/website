import { describe, expect, it } from "vitest";
import { parseRTTTL } from "@/lib/rtttl";

describe("parseRTTTL", () => {
  it("parses defaults and notes into playable data", () => {
    expect(parseRTTTL("Nokia:d=8,o=5,b=125:8e6,8d6,8p")).toMatchObject({
      defaults: { bpm: 125, duration: 8, octave: 5 },
      name: "Nokia",
      notes: [
        {
          duration: 8,
          frequency: 1318.4,
          isRest: false,
          octave: 6,
          pitch: "e",
        },
        {
          duration: 8,
          frequency: 1174.4,
          isRest: false,
          octave: 6,
          pitch: "d",
        },
        { duration: 8, frequency: 0, isRest: true, octave: 5, pitch: "p" },
      ],
    });
  });

  it("uses safe defaults for invalid numeric values", () => {
    expect(parseRTTTL("Test:d=0,o=nope,b=-1:c").defaults).toEqual({
      bpm: 63,
      duration: 4,
      octave: 6,
    });
  });

  it("rejects inputs without exactly three sections", () => {
    expect(() => parseRTTTL("Invalid:d=4,o=5,b=120")).toThrow(
      "Invalid RTTTL format",
    );
  });
});
