// src/controllers/songController.ts
import type { SongJSON } from '../schemas/song.js';
import { TrackManager } from './trackManager.js';
import { SongManager } from './songManager.js';
import { LocatorManager } from './locatorManager.js';
import { InstrumentManager } from './instrumentManager.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';
import { Section, Track } from '../types.js';

export class SongController {
  // private abletonWrapper: AbletonWrapper;
  private trackManager: TrackManager;
  private songManager: SongManager;
  private locatorManager: LocatorManager;
  private instrumentManager: InstrumentManager;

  constructor(abletonWrapper: AbletonWrapper) {
    // this.abletonWrapper = abletonWrapper;
    this.trackManager = new TrackManager(abletonWrapper);
    this.songManager = new SongManager(abletonWrapper);
    this.locatorManager = new LocatorManager(abletonWrapper, this.trackManager);
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
        await this.addChords(songData);
      }

      console.log('Song processing completed successfully');
    } catch (error) {
      console.error('Error processing song:', error);
      throw error;
    }
  }
  private async addChords(songData: SongJSON): Promise<void> {
    const chordTracks = songData.tracks.filter(track => track.role.toLowerCase() === 'chords');
    const sections = songData.song_structure?.sections ?? [];

    if (chordTracks.length === 0) {
      console.info('No chord tracks found.');
      return;
    }

    for (const track of chordTracks) {
      await this.songManager.createChords(songData.song_structure.signature_numerator, songData.song_structure.signature_denominator, track, sections ?? []);
    }
  }

  // song-level metadata like tempo/timeSignature/name are not part of SongJSON schema
  // and should be handled at a different layer if needed.

  private async createTracks(tracks: Track[]): Promise<void> {
    return this.trackManager.createTracks(tracks ?? []);
  }

  private async createLocators(sections: Section[]): Promise<void> {
    return this.locatorManager.createLocators(sections ?? []);
  }

  private async addInstruments(tracks: Track[]): Promise<void> {
    return this.instrumentManager.addInstrumentsToTracks(tracks ?? []);
  }
}
