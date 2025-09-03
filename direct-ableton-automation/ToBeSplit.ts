// src/controllers/songController.ts
import { Song } from '../types';
import { TrackManager } from './trackManager';
import { LocatorManager } from './locatorManager';
import { InstrumentManager } from './instrumentManager';
import { AbletonWrapper } from '../ableton/abletonWrapper';

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

  async processSong(songData: Song): Promise<void> {
    try {
      console.log('Starting song processing...');
      
      // Set basic song properties
      await this.setSongProperties(songData);
      
      // Create tracks first
      if (songData.tracks && songData.tracks.length > 0) {
        await this.createTracks(songData.tracks);
      }
      
      // Add locators/markers
      if (songData.locators && songData.locators.length > 0) {
        await this.createLocators(songData.locators);
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

  private async setSongProperties(songData: Song): Promise<void> {
    if (songData.tempo) {
      await this.abletonWrapper.setTempo(songData.tempo);
    }
    
    if (songData.timeSignature) {
      await this.abletonWrapper.setTimeSignature(
        songData.timeSignature.numerator,
        songData.timeSignature.denominator
      );
    }
    
    if (songData.name) {
      // Note: Song name setting might require direct LOM call
      await this.abletonWrapper.setSongName(songData.name);
    }
  }

  private async createTracks(tracks: Song['tracks']): Promise<void> {
    return this.trackManager.createTracks(tracks);
  }

  private async createLocators(locators: Song['locators']): Promise<void> {
    return this.locatorManager.createLocators(locators);
  }

  private async addInstruments(tracks: Song['tracks']): Promise<void> {
    return this.instrumentManager.addInstrumentsToTracks(tracks);
  }
}

// src/controllers/trackManager.ts
import { Track } from '../types';
import { AbletonWrapper } from '../ableton/abletonWrapper';

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
      await this.abletonWrapper.setTrackColor(trackId, trackData.color);
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
        (trackData.type === 'audio' || trackData.type === 'midi')) {
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

// src/controllers/locatorManager.ts
import { Locator } from '../types';
import { AbletonWrapper } from '../ableton/abletonWrapper';

export class LocatorManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async createLocators(locators: Locator[]): Promise<void> {
    console.log(`Creating ${locators.length} locators...`);
    
    for (const locator of locators) {
      await this.createLocator(locator);
    }
  }

  private async createLocator(locatorData: Locator): Promise<void> {
    try {
      await this.abletonWrapper.createLocator({
        time: locatorData.time,
        name: locatorData.name
      });
      
      console.log(`Locator "${locatorData.name}" created at ${locatorData.time}`);
    } catch (error) {
      console.error(`Error creating locator "${locatorData.name}":`, error);
      throw error;
    }
  }
}

// src/controllers/instrumentManager.ts
import { Track, Instrument } from '../types';
import { AbletonWrapper } from '../ableton/abletonWrapper';

export class InstrumentManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async addInstrumentsToTracks(tracks: Track[]): Promise<void> {
    console.log('Adding instruments to tracks...');
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.instruments && track.instruments.length > 0) {
        await this.addInstrumentsToTrack(i, track.instruments);
      }
    }
  }

  private async addInstrumentsToTrack(trackIndex: number, instruments: Instrument[]): Promise<void> {
    for (const instrument of instruments) {
      await this.addInstrument(trackIndex, instrument);
    }
  }

  private async addInstrument(trackIndex: number, instrumentData: Instrument): Promise<void> {
    try {
      // Add the instrument device
      const deviceId = await this.abletonWrapper.addInstrument(trackIndex, {
        name: instrumentData.name,
        preset: instrumentData.preset
      });

      // Configure instrument parameters if provided
      if (instrumentData.parameters) {
        await this.configureInstrumentParameters(deviceId, instrumentData.parameters);
      }

      console.log(`Instrument "${instrumentData.name}" added to track ${trackIndex}`);
    } catch (error) {
      console.error(`Error adding instrument "${instrumentData.name}":`, error);
      throw error;
    }
  }

  private async configureInstrumentParameters(
    deviceId: number, 
    parameters: Record<string, any>
  ): Promise<void> {
    for (const [paramName, value] of Object.entries(parameters)) {
      try {
        await this.abletonWrapper.setDeviceParameter(deviceId, paramName, value);
      } catch (error) {
        console.warn(`Could not set parameter ${paramName} to ${value}:`, error);
      }
    }
  }
}

// src/ableton/abletonWrapper.ts
import { Ableton } from 'ableton-js';

export interface ClipConfig {
  startTime: number;
  length: number;
  name?: string;
  color?: number;
}

export interface LocatorConfig {
  time: number;
  name: string;
}

export interface InstrumentConfig {
  name: string;
  preset?: string;
}

export class AbletonWrapper {
  private ableton: Ableton;

  constructor(ableton: Ableton) {
    this.ableton = ableton;
  }

  // Song-level operations
  async setTempo(bpm: number): Promise<void> {
    const song = await this.ableton.song.get('tempo');
    await song.set('value', bpm);
  }

  async setTimeSignature(numerator: number, denominator: number): Promise<void> {
    // May require direct LOM access
    try {
      await this.ableton.song.get('signature_numerator').then(sig => sig.set('value', numerator));
      await this.ableton.song.get('signature_denominator').then(sig => sig.set('value', denominator));
    } catch (error) {
      console.warn('Time signature setting may require direct LOM implementation');
      throw error;
    }
  }

  async setSongName(name: string): Promise<void> {
    // This might require direct LOM access as song name may not be directly settable
    console.warn('Song name setting may require direct LOM implementation');
  }

  // Track operations
  async createTrack(type: 'audio' | 'midi' | 'return' | 'master'): Promise<number> {
    let track;
    
    switch (type) {
      case 'audio':
        track = await this.ableton.song.create_audio_track();
        break;
      case 'midi':
        track = await this.ableton.song.create_midi_track();
        break;
      case 'return':
        track = await this.ableton.song.create_return_track();
        break;
      case 'master':
        // Master track already exists, get reference
        track = await this.ableton.song.get('master_track');
        break;
      default:
        throw new Error(`Unknown track type: ${type}`);
    }

    // Get track index for future reference
    const tracks = await this.ableton.song.get('tracks');
    const trackList = await tracks.get('children');
    return trackList.length - 1; // Return index of newly created track
  }

  async setTrackName(trackIndex: number, name: string): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    await track.set('name', name);
  }

  async setTrackColor(trackIndex: number, color: number): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    await track.set('color', color);
  }

  async setTrackVolume(trackIndex: number, volume: number): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    const mixer = await track.get('mixer_device');
    const volumeParam = await mixer.get('volume');
    await volumeParam.set('value', volume);
  }

  async setTrackPan(trackIndex: number, pan: number): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    const mixer = await track.get('mixer_device');
    const panParam = await mixer.get('panning');
    await panParam.set('value', pan);
  }

  async setTrackMuted(trackIndex: number, muted: boolean): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    await track.set('mute', muted ? 1 : 0);
  }

  async setTrackSolo(trackIndex: number, solo: boolean): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    await track.set('solo', solo ? 1 : 0);
  }

  async setTrackArmed(trackIndex: number, armed: boolean): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    await track.set('arm', armed ? 1 : 0);
  }

  // Clip operations
  async createClip(trackIndex: number, clipConfig: ClipConfig): Promise<void> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    const clipSlots = await track.get('clip_slots');
    
    // Find first empty clip slot or create new one
    const slots = await clipSlots.get('children');
    let targetSlot = null;
    
    for (const slot of slots) {
      const hasClip = await slot.get('has_clip');
      if (!hasClip) {
        targetSlot = slot;
        break;
      }
    }

    if (targetSlot) {
      await targetSlot.create_clip(clipConfig.length);
      const clip = await targetSlot.get('clip');
      
      if (clipConfig.name) {
        await clip.set('name', clipConfig.name);
      }
      
      if (clipConfig.color !== undefined) {
        await clip.set('color', clipConfig.color);
      }
    }
  }

  // Locator operations
  async createLocator(locatorConfig: LocatorConfig): Promise<void> {
    try {
      const cuePoints = await this.ableton.song.get('cue_points');
      await cuePoints.create_cue_point(locatorConfig.time);
      
      // Set locator name if provided
      if (locatorConfig.name) {
        const cuePointsList = await cuePoints.get('children');
        const lastCuePoint = cuePointsList[cuePointsList.length - 1];
        await lastCuePoint.set('name', locatorConfig.name);
      }
    } catch (error) {
      console.warn('Locator creation may require alternative approach or direct LOM access');
      throw error;
    }
  }

  // Instrument operations
  async addInstrument(trackIndex: number, instrumentConfig: InstrumentConfig): Promise<number> {
    const tracks = await this.ableton.song.get('tracks');
    const track = await tracks.get('children').then(children => children[trackIndex]);
    const devices = await track.get('devices');
    
    // This is a simplified approach - actual instrument loading may require
    // browsing the Live browser and loading specific instruments
    try {
      const device = await devices.create_device(instrumentConfig.name);
      
      if (instrumentConfig.preset) {
        // Loading presets may require additional browser navigation
        console.log(`Loading preset ${instrumentConfig.preset} for ${instrumentConfig.name}`);
      }
      
      const deviceList = await devices.get('children');
      return deviceList.length - 1; // Return device index
    } catch (error) {
      console.warn(`Instrument loading may require browser navigation: ${error}`);
      throw error;
    }
  }

  async setDeviceParameter(deviceId: number, parameterName: string, value: any): Promise<void> {
    // This would need to access the specific device and its parameters
    // Implementation depends on the device type and available parameters
    console.log(`Setting ${parameterName} to ${value} on device ${deviceId}`);
  }
}

// src/index.ts - Updated main entry point
import { Ableton } from 'ableton-js';
import { Song } from './types';
import { SongController } from './controllers/songController';
import { AbletonWrapper } from './ableton/abletonWrapper';

export async function processAbletonSong(songData: Song): Promise<void> {
  const ableton = new Ableton({ logger: console });
  const abletonWrapper = new AbletonWrapper(ableton);
  const songController = new SongController(abletonWrapper);
  
  try {
    await ableton.start();
    console.log('Connected to Ableton Live');
    
    await songController.processSong(songData);
    
    console.log('Song processing completed successfully');
  } catch (error) {
    console.error('Error processing song:', error);
    throw error;
  } finally {
    await ableton.stop();
  }
}

// Export the main function and controllers for external use
export { SongController, TrackManager, LocatorManager, InstrumentManager, AbletonWrapper };
