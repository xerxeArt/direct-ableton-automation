// src/controllers/trackManager.ts
import type { Track } from '../types.js';
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

  private async createTrack(trackData: Track): Promise<void> {
    try {
      // Create the track based on type
      const trackId = await this.abletonWrapper.createTrack(trackData.type);
      trackData.id = trackId;

      // Set track properties
      await this.setTrackProperties(trackId, trackData);

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
  }
}
