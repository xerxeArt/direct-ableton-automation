// src/controllers/highlevel.ts
import type { LocatorSpec, SectionSpec, TrackSpec } from "../types.js";

// In future: import ableton from "ableton-js";
// and lower layers: song.set("current_song_time"); song.call("set_or_delete_cue")

export async function createLocators(locators: SectionSpec[]): Promise<void> {
  // TODO: ableton.song.* calls per locator.bar and locator.name
}

export type LiveTrackRef = { id: string; name: string };

export async function createTracks(specs: TrackSpec[]): Promise<LiveTrackRef[]> {
  // TODO: create groups, colors, track types; return LiveTrackRef[]
  return specs.map((t, i) => ({ id: `track-${i}`, name: t.name }));
}

export async function addInstruments(
  liveTracks: LiveTrackRef[],
  specs: TrackSpec[]
): Promise<number> {
  // TODO: device chains, ExternalInstrument device setup
  return specs.filter(s => s.device_chain || s.external_instrument).length;
}
