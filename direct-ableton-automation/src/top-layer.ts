// src/top-layer.ts
import { z } from "zod";
import { SongJSON } from "./types";
import { createTracks, createLocators, addInstruments } from "./controllers/highlevel";

const zSong: z.ZodType<SongJSON> = z.object({
  song_structure: z.object({
    total_length_bars: z.number().int().positive(),
    sections: z.array(z.object({
      name: z.string(),
      start_bar: z.number().int().positive(),
      length_bars: z.number().int().positive(),
      mood: z.string().optional(),
      chords: z.array(z.string()).optional(),
    })),
    locators: z.array(z.object({ bar: z.number().int().positive(), name: z.string() })),
  }),
  tracks: z.array(z.object({
    name: z.string(),
    role: z.string(),
    type: z.enum(["MIDI","Audio","ExternalInstrument"]),
    device_chain: z.array(z.object({ device: z.string(), preset: z.string().optional() })).optional(),
    external_instrument: z.object({
      midi_port: z.string(),
      midi_channel: z.number().int().min(1).max(16),
      audio_from: z.string(),
      latency_ms: z.number().int(),
    }).optional(),
    color: z.string().optional(),
    group: z.string().optional(),
    comments: z.string().optional(),
  })),
});

export type TopLayerResult = {
  tracks_created: number;
  locators_created: number;
  instruments_added: number;
};

export async function applySong(json: unknown): Promise<TopLayerResult> {
  const cfg = zSong.parse(json);

  // High-level orchestration
  await createLocators(cfg.song_structure.locators);
  const tracks = await createTracks(cfg.tracks);
  const added = await addInstruments(tracks, cfg.tracks);

  return {
    tracks_created: tracks.length,
    locators_created: cfg.song_structure.locators.length,
    instruments_added: added,
  };
}
