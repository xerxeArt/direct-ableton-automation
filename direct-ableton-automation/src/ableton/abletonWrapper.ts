// src/ableton/abletonWrapper.ts
import type { Ableton } from 'ableton-js';
import type { LiveTrackKind } from '../types.js';
import { timeBarToBeats } from '../tools/timeTools.js';

export interface ClipConfig {
    startTime: number;
    length: number;
    name?: string;
    color?: number;
}

export interface LocatorConfig {
    time_bar: number;
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
        // library exposes tempo as a numeric property; use song.set if available
        // fall back to direct assignment via any casts
        // runtime LOM interop
        const songAny: any = this.ableton.song;
        if (typeof songAny.set === 'function') {
            await songAny.set('tempo', bpm);
        } else if (songAny.tempo !== undefined) {
            songAny.tempo = bpm;
        }
    }

    async setTimeSignature(numerator: number, denominator: number): Promise<void> {
        // May require direct LOM access
        try {
            const songAny: any = this.ableton.song;
            if (typeof songAny.set === 'function') {
                await songAny.set('signature_numerator', numerator);
                await songAny.set('signature_denominator', denominator);
            } else {
                songAny.signature_numerator = numerator;
                songAny.signature_denominator = denominator;
            }
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
    async createTrack(type: LiveTrackKind): Promise<number> {
        let track;

        switch (type) {
            case 'audio':
                // ableton-js exposes camelCase creation methods
                // use camelCase API when available
                track = await this.ableton.song.createAudioTrack();
                break;
            case 'midi':
                // use camelCase API when available
                track = await this.ableton.song.createMidiTrack();
                break;
            case 'return':
                // use camelCase API when available
                track = await this.ableton.song.createReturnTrack();
                break;
            case 'master':
                // Master track already exists, get reference
                track = await this.ableton.song.get('master_track');
                break;
            default:
                throw new Error(`Unknown track type: ${type}`);
        }

        // Get track index for future reference
        // Use library's get('tracks') pattern and access children safely
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        return children.length - 1; // Return index of newly created track
    }

    async setTrackName(trackIndex: number, name: string): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        await track.set?.('name', name);
    }

    async setTrackColor(trackIndex: number, color: number): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        await track.set?.('color', color);
    }

    async setTrackVolume(trackIndex: number, volume: number): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        const mixer: any = await track.get?.('mixer_device') ?? await track.get?.('mixerDevice');
        const volumeParam: any = await mixer?.get?.('volume');
        await volumeParam?.set?.('value', volume);
    }

    async setTrackPan(trackIndex: number, pan: number): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        const mixer: any = await track.get?.('mixer_device') ?? await track.get?.('mixerDevice');
        const panParam: any = await mixer?.get?.('panning');
        await panParam?.set?.('value', pan);
    }

    async setTrackMuted(trackIndex: number, muted: boolean): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        await track.set?.('mute', muted ? 1 : 0);
    }

    async setTrackSolo(trackIndex: number, solo: boolean): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        await track.set?.('solo', solo ? 1 : 0);
    }

    async setTrackArmed(trackIndex: number, armed: boolean): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        await track.set?.('arm', armed ? 1 : 0);
    }

    // Clip operations
    async createClip(trackIndex: number, clipConfig: ClipConfig): Promise<void> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        const clipSlots: any = await track.get?.('clip_slots') ?? await track.get?.('clipSlots');

        // Find first empty clip slot or create new one
        const slots = Array.isArray(clipSlots) ? clipSlots : await clipSlots.get?.('children') ?? [];
        let targetSlot = null;

        for (const slot of slots) {
            const hasClip = await slot.get?.('has_clip') ?? await slot.get?.('hasClip');
            if (!hasClip) {
                targetSlot = slot;
                break;
            }
        }

        if (targetSlot) {
            // use camelCase API when available
            await targetSlot.createClip?.(clipConfig.length) ?? await targetSlot.create_clip?.(clipConfig.length);
            const clip = await targetSlot.get?.('clip');

            if (clipConfig.name) {
                await clip.set?.('name', clipConfig.name);
            }

            if (clipConfig.color !== undefined) {
                await clip.set?.('color', clipConfig.color);
            }
        }
    }

    // Locator operations
    async createLocator(locatorConfig: LocatorConfig): Promise<void> {
        try {
            const songAny: any = this.ableton.song;
            const beatTime = await timeBarToBeats(songAny, locatorConfig.time_bar);

            // Move playhead to requested time (preferred approach for set_or_delete_cue APIs)
            await this.movePlayhead(songAny, beatTime);

            // Try to create/set the cue (non-fatal)
            try {
                await this.tryCreateCue(songAny, beatTime);
            } catch (e) {
                console.warn('Cue creation call failed or not available, will try to locate existing cue:', e);
            }

            // If a name was provided, find the cue point near the requested time and set its name
            if (locatorConfig.name) {
                await this.nameCueNear(songAny, beatTime, locatorConfig.name);
            }
        } catch (error) {
            console.warn('Locator creation may require alternative approach or direct LOM access');
            throw error;
        }
    }

    // ...existing code...

    // Instrument operations
    async addInstrument(trackIndex: number, instrumentConfig: InstrumentConfig): Promise<number> {
        const tracksAny: any = await this.ableton.song.get('tracks');
        const children = Array.isArray(tracksAny) ? tracksAny : await tracksAny.get?.('children') ?? [];
        const track: any = children[trackIndex];
        const devices: any = await track.get?.('devices') ?? await track.get?.('devices');

        // This is a simplified approach - actual instrument loading may require
        // browsing the Live browser and loading specific instruments
        try {
            const device = await devices.createDevice?.(instrumentConfig.name) ?? await devices.create_device?.(instrumentConfig.name);

            if (instrumentConfig.preset) {
                // Loading presets may require additional browser navigation
                console.log(`Loading preset ${instrumentConfig.preset} for ${instrumentConfig.name}`);
            }

            const deviceList = Array.isArray(devices) ? devices : await devices.get?.('children') ?? [];
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

    // Helper: move playhead to a beat time using whatever setter is available
    private async movePlayhead(songAny: any, beatTime: number): Promise<void> {
        if (typeof songAny.set === 'function') {
            await songAny.set('current_song_time', beatTime);
        } else {
            songAny.current_song_time = beatTime;
        }
    }

    // Helper: try common LOM methods to create/set a cue at the given beat time
    private async tryCreateCue(songAny: any, beatTime: number): Promise<void> {
        if (typeof songAny.call === 'function') {
            // some Live APIs expose generic call(name, arg)
            await songAny.call('set_or_delete_cue', beatTime);
        } else if (typeof songAny.set_or_delete_cue === 'function') {
            await songAny.set_or_delete_cue(beatTime);
        } else if (typeof songAny.setOrDeleteCue === 'function') {
            await songAny.setOrDeleteCue(beatTime);
        } else {
            // fallback to cue_points helper creation if present
            const cuePoints: any = await songAny.get?.('cue_points') ?? await songAny.get?.('cuePoints');
            await (cuePoints?.createCuePoint?.(beatTime) ?? cuePoints?.create_cue_point?.(beatTime));
        }
    }

    // Helper: find an existing cue near beatTime and set its name
    private async nameCueNear(songAny: any, beatTime: number, name: string): Promise<void> {
        const cuePointsAny: any = await songAny.get?.('cue_points') ?? await songAny.get?.('cuePoints');
        const cues = Array.isArray(cuePointsAny) ? cuePointsAny : await cuePointsAny?.get?.('children') ?? [];

        const eps = 1e-3;
        for (let i = 0; i < cues.length; i++) {
            try {
                const cp: any = cues[i];
                const timeVal = await cp.get?.('time') ?? await cp.get?.('song_time') ?? cp.time;
                const t = typeof timeVal === 'number' ? timeVal : Number(timeVal);
                if (!Number.isFinite(t)) continue;
                if (Math.abs(t - beatTime) < eps) {
                    await cp.set?.('name', name);
                    return;
                }
            } catch (inner) {
                // ignore per-cue errors and continue
                console.warn('Error inspecting cue point, continuing', inner);
            }
        }
    }
}
