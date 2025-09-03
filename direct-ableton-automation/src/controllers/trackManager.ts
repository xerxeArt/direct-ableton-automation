// src/controllers/trackManager.ts
import type { Track } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';
import { parseNamedColorToInt, NAMED_COLORS } from '../tools/colorTools.js';

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
        colorInt = parseNamedColorToInt(NAMED_COLORS.gray);
      } else {
        await this.abletonWrapper.setTrackColor(trackId, colorInt);
      }
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
