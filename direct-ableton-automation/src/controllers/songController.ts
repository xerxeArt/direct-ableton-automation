// src/controllers/songController.ts
import type { LiveTrackKind, SongJSON } from '../schemas/song.js';
import { TrackManager } from './trackManager.js';
import { LocatorManager } from './locatorManager.js';
import { InstrumentManager } from './instrumentManager.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';

export class SongController {
  // private abletonWrapper: AbletonWrapper;
  private trackManager: TrackManager;
  private locatorManager: LocatorManager;
  private instrumentManager: InstrumentManager;

  constructor(abletonWrapper: AbletonWrapper) {
    // this.abletonWrapper = abletonWrapper;
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
      if (songData.song_structure && songData.song_structure.sections && songData.song_structure.sections.length > 0) {
        await this.createLocators(songData.song_structure.sections);
      }

      // Add instruments to tracks
      if (songData.tracks) {
        await this.addInstruments(songData.tracks);
      }

      // Add instruments to tracks
      if (songData.tracks &&
        songData.song_structure && songData.song_structure.sections && songData.song_structure.sections.length > 0
      ) {
        await this.addChords(songData.tracks);
      }

      console.log('Song processing completed successfully');
    } catch (error) {
      console.error('Error processing song:', error);
      throw error;
    }
  }
  private async addChords(tracks: SongJSON['tracks']): Promise<void> {
    return this.trackManager.createChords(tracks ?? []);
  }

  // song-level metadata like tempo/timeSignature/name are not part of SongJSON schema
  // and should be handled at a different layer if needed.

  private async createTracks(tracks: SongJSON['tracks'], sections: SongJSON['song_structure']['sections']): Promise<void> {
    return this.trackManager.createTracks(tracks ?? []);
  }

  private async createLocators(sections: SongJSON['song_structure']['sections']): Promise<void> {
    return this.locatorManager.createLocators(sections ?? []);
  }

  private async addInstruments(tracks: SongJSON['tracks']): Promise<void> {
    return this.instrumentManager.addInstrumentsToTracks(tracks ?? []);
  }
}
