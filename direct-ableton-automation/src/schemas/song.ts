// src/schemas/song.ts
import { z } from 'zod';

// Runtime enum for track kinds. This lives here so the Zod schema is the
// single source-of-truth for allowed track kinds (runtime + types).
export enum LiveTrackKind {
  Audio = 'audio',
  Midi = 'midi',
  Return = 'return',
  Master = 'master',
}
// Sub-schemas
export const zDeviceSpec = z.object({ device: z.string(), preset: z.string().optional() });
export const zExternalInstrument = z.object({
  midi_port: z.string(),
  midi_channel: z.number().int().min(1).max(16),
  audio_from: z.string(),
  latency_ms: z.number().int(),
});

export const zSection = z.object({
  name: z.string(),
  start_bar: z.number().int().positive(),
  length_bars: z.number().int().positive(),
  mood: z.string().optional(),
  chords: z.array(z.string()).optional(),
});

export const zTrackSpec = z.object({
  name: z.string(),
  role: z.string(),
  type: z.enum(LiveTrackKind),
  device_chain: z.array(zDeviceSpec).optional(),
  external_instrument: zExternalInstrument.optional(),
  color: z.string().optional(),
  group: z.string().optional(),
  comments: z.string().optional(),
});

// A couple of runtime-only helper types for tracks
export const zClip = z.object({ startTime: z.number(), length: z.number(), name: z.string().optional(), color: z.number().optional() });
export const zInstrumentSpec = z.object({ name: z.string(), preset: z.string().optional(), parameters: z.record(z.string(), z.any()).optional() });

// Aggregate song schema
export const zSong = z.object({
  song_structure: z.object({
    total_length_bars: z.number().int().positive(),
    sections: z.array(zSection),
  }),
  tracks: z.array(zTrackSpec),
});

// Exported types inferred from the schema (single source-of-truth)
export type DeviceSpec = z.infer<typeof zDeviceSpec>;
export type ExternalInstrument = z.infer<typeof zExternalInstrument>;
export type SectionSpec = z.infer<typeof zSection>;
export type TrackSpec = z.infer<typeof zTrackSpec>;
export type Clip = z.infer<typeof zClip>;
export type InstrumentSpec = z.infer<typeof zInstrumentSpec>;
export type SongStructure = z.infer<typeof zSong>['song_structure'];
export type SongJSON = z.infer<typeof zSong>;

// Compatibility / runtime-only aliases for controllers
export type Track = TrackSpec & {
  clips?: Clip[];
  instruments?: InstrumentSpec[];
  volume?: number;
  pan?: number;
  muted?: boolean;
  solo?: boolean;
  armed?: boolean;
};

export type Instrument = InstrumentSpec;

export default zSong;
