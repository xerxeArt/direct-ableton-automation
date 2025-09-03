// src/controllers/songController.ts
import type { SongJSON } from '../schemas/song.js';
import { TrackManager } from './trackManager.js';
import { LocatorManager } from './locatorManager.js';
import { InstrumentManager } from './instrumentManager.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';

export class SongController {
  private abletonWrapper: AbletonWrapper;
  private trackManager: TrackManager;
  private locatorManager: LocatorManager;
  private instrumentManager: InstrumentManager;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
    this.trackManager = new TrackManager(abletonWrapper);
    this.locatorManager = new LocatorManager(abletonWrapper);
    this.instrumentManager = new InstrumentManager(abletonWrapper);
  }

  async processSong(songData: SongJSON): Promise<void> {
    try {
      console.log('Starting song processing...');
      
      
      // Create tracks first
      if (songData.tracks && songData.tracks.length > 0) {
        await this.createTracks(songData.tracks);
      }
      
      // Add locators/markers from song_structure
      if (songData.song_structure && songData.song_structure.locators && songData.song_structure.locators.length > 0) {
        await this.createLocators(songData.song_structure.locators);
      }
      
      // Add instruments to tracks
      if (songData.tracks) {
        await this.addInstruments(songData.tracks);
      }
      
      console.log('Song processing completed successfully');
    } catch (error) {
      console.error('Error processing song:', error);
      throw error;
    }
  }

  // song-level metadata like tempo/timeSignature/name are not part of SongJSON schema
  // and should be handled at a different layer if needed.

  private async createTracks(tracks: SongJSON['tracks']): Promise<void> {
    return this.trackManager.createTracks(tracks ?? []);
  }

  private async createLocators(locators: SongJSON['song_structure']['locators']): Promise<void> {
    return this.locatorManager.createLocators(locators ?? []);
  }

  private async addInstruments(tracks: SongJSON['tracks']): Promise<void> {
    return this.instrumentManager.addInstrumentsToTracks(tracks ?? []);
  }
}
