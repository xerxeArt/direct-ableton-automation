Always answer shortly, to the point. No introductory or conclusionary expressions. Optimize the discussion for multiple iterations.
For creating music with Ableton, controlled via ableton-js, we will develop a TypeScript tool that will receive a JSON and call ableton-js functions for Ableton Live operations.
Architecture:
- top layer: receive the JSON with song data (contract is the below JSON initially, it is bound to change as the software develops)
- layer for calling top-level functions like create_tracks, create_locators, add_instruments.
- implementation layer: loop through tracks and create each one
- ableton-js wrapper for direct calling of its functions. Some functions may not be directly available, so we might use direct LOM function calls.
The initial JSON template example:
```json
{
  "song_structure": {
    "total_length_bars": 128,
    "sections": [
      {"name": "Intro", "start_bar": 1, "length_bars": 8, "mood": "open", "chords": ["C", "F"]},
      {"name": "Verse 1", "start_bar": 9, "length_bars": 16, "mood": "narrative", "chords": ["C", "Am", "F", "G"]},
      {"name": "Pre", "start_bar": 25, "length_bars": 8},
      {"name": "Chorus", "start_bar": 33, "length_bars": 16}
    ],
    "locators": [
      {"bar": 1, "name": "Intro"},
      {"bar": 9, "name": "Verse 1"},
      {"bar": 25, "name": "Pre"},
      {"bar": 33, "name": "Chorus"}
    ]
  },
  "tracks": [
    {
      "name": "01 Kick",
      "role": "Kick",
      "type": "MIDI",
      "device_chain": [{"device": "DrumRack", "preset": "Init"}],
      "color": "Red",
      "group": "Drums",
      "comments": ""
    },
    {
      "name": "02 Snare",
      "role": "Snare",
      "type": "MIDI",
      "device_chain": [{"device": "DrumRack"}],
      "color": "Orange",
      "group": "Drums"
    },
    {
      "name": "10 Bass",
      "role": "Bass",
      "type": "MIDI",
      "device_chain": [{"device": "Operator", "preset": "Init Bass"}],
      "color": "Blue",
      "group": "LowEnd"
    },
    {
      "name": "20 TR76",
      "role": "External Synth",
      "type": "ExternalInstrument",
      "external_instrument": {
        "midi_port": "UMC1810 MIDI",
        "midi_channel": 1,
        "audio_from": "Input 1-2",
        "latency_ms": 0
      },
      "color": "Purple",
      "group": "External"
    }
  ]
}
```

For setting sections (arrangement view locators), we will call ableton.song.set("current_song_time") and ableton.song.call("set_or_delete_cue").
