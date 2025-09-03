// src/types.ts
// Re-export canonical, schema-derived types from src/schemas/song.ts so other
// modules can import types from a single barrel (avoid importing schema directly).
export type { DeviceSpec, ExternalInstrument, TrackSpec, SectionSpec, SongStructure, SongJSON, Clip, InstrumentSpec as Instrument } from './schemas/song.js';
export { LiveTrackKind } from './schemas/song.js';

// Compatibility alias: Track runtime shape used by controllers
import type { TrackSpec as _TrackSpec, Clip as _Clip, InstrumentSpec as _InstrumentSpec } from './schemas/song.js';
export type Track = _TrackSpec & { clips?: _Clip[]; instruments?: _InstrumentSpec[]; volume?: number; pan?: number; muted?: boolean; solo?: boolean; armed?: boolean };

