// src/types.ts
export type DeviceSpec = { device: string; preset?: string };
export type ExternalInstrument = {
  midi_port: string; midi_channel: number;
  audio_from: string; latency_ms: number;
};

export type TrackSpec = {
  name: string;
  role: string;
  type: "MIDI" | "Audio" | "ExternalInstrument";
  device_chain?: DeviceSpec[];
  external_instrument?: ExternalInstrument;
  color?: string;
  group?: string;
  comments?: string;
};

export type SectionSpec = {
  name: string; start_bar: number; length_bars: number;
  mood?: string; chords?: string[];
};

export type LocatorSpec = { bar: number; name: string };

export type SongStructure = {
  total_length_bars: number;
  sections: SectionSpec[];
  locators: LocatorSpec[];
};

export type SongJSON = {
  song_structure: SongStructure;
  tracks: TrackSpec[];
};
