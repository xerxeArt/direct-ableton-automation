// src/controllers/trackManager.ts
import type { SongJSON, Track } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';
import { parseNamedColorToInt } from '../tools/colorTools.js';

export class TrackManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async createTracks(tracks: Track[]): Promise<void> {
    console.log(`Creating ${tracks.length} tracks...`);

    for (const track of tracks) {
      await this.createTrack(track);
    }
  }

  // TODO: move this to another manager
  async createChords(tracks: Track[], sections: SongJSON['song_structure']['sections']): Promise<void> {
    console.log(`Creating chords for ${tracks.length} tracks...`);
    //Identify the track to create chords on by role==chords
    const chordTracks = tracks.filter(track => track.role === 'chords');

    if (chordTracks.length === 0) {
      console.info('No chord tracks found.');
      return;
    }

    for (const track of chordTracks) {
      await this.createChordsOnTrack(track, sections);
    }
  }
  // TODO: WiP
  private async createChordsOnTrack(track: Track, sections: SongJSON['song_structure']['sections']): Promise<void> {
    for (const section of sections) {
      const chords = section.chords || [];
      await this.abletonWrapper.createClip(track.id, {
        startTime: section.start_bar,
        length: section.length_bars,
        name: `Chords - ${track.name}`
      });
    }
  }


  private async createTrack(trackData: Track): Promise<void> {
    try {
      // Create the track based on type
      const trackId = await this.abletonWrapper.createTrack(trackData.type);

      // Set track properties
      await this.setTrackProperties(trackId, trackData);

      // Handle clips if present
      if (trackData.clips && trackData.clips.length > 0) {
        await this.addClipsToTrack(trackId, trackData.clips);
      }

      console.log(`Track "${trackData.name}" created successfully`);
    } catch (error) {
      console.error(`Error creating track "${trackData.name}":`, error);
      throw error;
    }
  }

  private async setTrackProperties(trackId: number, trackData: Track): Promise<void> {
    // Set track name
    if (trackData.name) {
      await this.abletonWrapper.setTrackName(trackId, trackData.name);
    }

    // Set track color
    if (trackData.color) {
      var colorInt = typeof trackData.color === 'string' ? parseNamedColorToInt(trackData.color) : null;
      if (colorInt === null) {
        console.warn(`Track color '${trackData.color}' is not a known color; setting default`);
        colorInt = parseNamedColorToInt('gray') ?? 0;
      }
      await this.abletonWrapper.setTrackColor(trackId, colorInt);
    }

    // Set volume
    if (trackData.volume !== undefined) {
      await this.abletonWrapper.setTrackVolume(trackId, trackData.volume);
    }

    // Set pan
    if (trackData.pan !== undefined) {
      await this.abletonWrapper.setTrackPan(trackId, trackData.pan);
    }

    // Set mute/solo states
    if (trackData.muted !== undefined) {
      await this.abletonWrapper.setTrackMuted(trackId, trackData.muted);
    }

    if (trackData.solo !== undefined) {
      await this.abletonWrapper.setTrackSolo(trackId, trackData.solo);
    }

    // Set arm state for audio/MIDI tracks
    if (trackData.armed !== undefined &&
      (trackData.type.toLowerCase() === 'audio' || trackData.type.toLowerCase() === 'midi')) {
      await this.abletonWrapper.setTrackArmed(trackId, trackData.armed);
    }
  }

  private async addClipsToTrack(trackId: number, clips: Track['clips']): Promise<void> {
    if (!clips) return;

    for (const clip of clips) {
      await this.abletonWrapper.createClip(trackId, {
        startTime: clip.startTime,
        length: clip.length,
        name: clip.name,
        color: clip.color
      });
    }
  }
}
