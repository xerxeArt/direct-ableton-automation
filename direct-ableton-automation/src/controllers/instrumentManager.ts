// src/controllers/instrumentManager.ts
import type { Track, Instrument } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';

export class InstrumentManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async addInstrumentsToTracks(tracks: Track[]): Promise<void> {
    console.log('Adding instruments to tracks...');
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      // Guard against undefined when project uses strict indexed access
      if (!track) continue;
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
