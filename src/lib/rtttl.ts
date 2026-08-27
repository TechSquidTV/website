export interface RTTTLNote {
  duration: number;
  pitch: string;
  octave: number;
  frequency: number;
  isRest: boolean;
}

export interface RTTTLData {
  name: string;
  defaults: RTTTLDefaults;
  notes: RTTTLNote[];
}

export interface RTTTLDefaults {
  duration: number;
  octave: number;
  bpm: number;
}

const DEFAULTS: RTTTLDefaults = { duration: 4, octave: 6, bpm: 63 };

const NOTE_FREQUENCIES: Readonly<Record<string, number>> = {
  a: 27.5,
  "a#": 29.14,
  b: 30.87,
  c: 16.35,
  "c#": 17.32,
  d: 18.35,
  "d#": 19.45,
  e: 20.6,
  f: 21.83,
  "f#": 23.12,
  g: 24.5,
  "g#": 25.96,
};

function parsePositiveInteger(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

function parseDefaults(defaultsString: string): RTTTLDefaults {
  const defaults = { ...DEFAULTS };

  for (const part of defaultsString.split(",")) {
    const [key, value] = part.trim().split("=");
    const parsedValue = parsePositiveInteger(value);

    if (key === undefined || parsedValue === undefined) {
      continue;
    }

    switch (key.toLowerCase()) {
      case "d":
        defaults.duration = parsedValue;
        break;
      case "o":
        defaults.octave = parsedValue;
        break;
      case "b":
        defaults.bpm = parsedValue;
        break;
    }
  }

  return defaults;
}

function frequencyFor(pitch: string, octave: number): number {
  const baseFrequency = NOTE_FREQUENCIES[pitch];
  return baseFrequency === undefined ? 440 : baseFrequency * 2 ** octave;
}

function parseNote(
  noteString: string,
  defaults: RTTTLDefaults,
): RTTTLNote | null {
  const match = noteString.match(/^(\d+)?([a-g]#?|p)(\d+)?\.?$/iu);
  if (!match) {
    return null;
  }

  const [, durationString, pitchString, octaveString] = match;
  if (pitchString === undefined) {
    return null;
  }

  const pitch = pitchString.toLowerCase();
  const octave = parsePositiveInteger(octaveString) ?? defaults.octave;
  const isRest = pitch === "p";

  return {
    duration: parsePositiveInteger(durationString) ?? defaults.duration,
    frequency: isRest ? 0 : frequencyFor(pitch, octave),
    isRest,
    octave,
    pitch,
  };
}

function parseNotes(notesString: string, defaults: RTTTLDefaults): RTTTLNote[] {
  return notesString
    .split(",")
    .map((note) => parseNote(note.trim(), defaults))
    .filter((note): note is RTTTLNote => note !== null);
}

export function parseRTTTL(input: string): RTTTLData {
  const [name, defaultsString, notesString, ...extraParts] = input.split(":");

  if (
    name === undefined ||
    defaultsString === undefined ||
    notesString === undefined ||
    extraParts.length > 0
  ) {
    throw new Error("Invalid RTTTL format");
  }

  const defaults = parseDefaults(defaultsString);

  return {
    defaults,
    name: name.trim(),
    notes: parseNotes(notesString, defaults),
  };
}
