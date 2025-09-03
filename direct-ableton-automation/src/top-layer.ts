// src/top-layer.ts
import zSong, { SongJSON } from "./schemas/song.js";
import { createTracks, createLocators, addInstruments } from "./controllers/highlevel.js";

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
