// src/types.ts
// Re-export canonical, schema-derived types from src/schemas/song.ts so other
// modules can import types from a single barrel (avoid importing schema directly).
export type { SongJSON } from './schemas/song.js';
export { LiveTrackKind } from './schemas/song.js';

import type { TrackSpec as Track, ClipSpec as Clip, InstrumentSpec as Instrument, SectionSpec as Section } from './schemas/song.js';
export { Clip, Instrument, Section, Track }

export type Note = {
  pitch: number;
  startTimeBeats: number;
  durationBeats: number;
  velocity: number;
}

export type ClipWithNotes = {
  startTimeBeats: number;
  lengthBeats: number;
  name?: string;
  color?: string;
  notes: Array<Note>;
}