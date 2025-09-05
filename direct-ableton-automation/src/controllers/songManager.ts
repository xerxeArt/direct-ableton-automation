import { AbletonWrapper } from "../ableton/abletonWrapper.js";
import { generateChord, noteNameToSemitone, velocityForIntensity } from "../tools/noteTools.js";
import { timeBarToBeats } from "../tools/timeTools.js";
import { Track, Section, ClipWithNotes, Note } from "../types.js";

export class SongManager {
    private abletonWrapper: AbletonWrapper;

    constructor(abletonWrapper: AbletonWrapper) {
        this.abletonWrapper = abletonWrapper;
    }

    async createChords(numerator: number, denominator: number, track: Track, sections: Section[]): Promise<void> {
        console.log(`Creating chords for ${track.name}`);

        for (const section of sections) {
            await this.createChordsOnTrackSection(numerator, denominator, track, section);
        }
    }
    private async createChordsOnTrackSection(numerator: number, denominator: number, track: Track, section: Section): Promise<void> {
        const clip: ClipWithNotes = {
            startTimeBeats: await timeBarToBeats(numerator, denominator, section.start_bar - 1),
            lengthBeats: await timeBarToBeats(numerator, denominator, section.length_bars),
            color: track.color,
            name: section.name,
            notes: this.createNotesForChords(numerator, denominator, section)
        };

        //TODO: This isn't working, check why
        await this.abletonWrapper.createClip(track.id ?? 0, clip);
    }

    private createNotesForChords(numerator: number, denominator: number, section: Section): Array<Note> {
        const notes: Array<Note> = [];

        if (section.chords === undefined || section.chords.length === 0) {
            console.info('No chords found in section.');
            return notes;
        }

        // beats per bar measured in quarter-note beats
        const beatsPerBar = numerator * (4 / denominator);

        // Determine intensity (0..1) from section if available; default to 0.5
        const intensity = section.energy ?? 0.5;


        const baseVelocity = velocityForIntensity(intensity);

        // For each bar in the section, create a chord (loop chords if fewer than bars)
        const chords = section.chords!; // we already guarded for undefined/empty above
        for (let barIndex = 0; barIndex < section.length_bars; barIndex++) {
            const chordNameRaw = chords[barIndex % chords.length] ?? 'C';

            // handle slash chords (e.g. E#/G) by taking the left side as chord root
            const chordRootPart = (chordNameRaw.split('/')[0] ?? 'C').trim();

            // parse root note letters (e.g., G, G#, Bb)
            const match = chordRootPart.match(/^([A-Ga-g][#b]?)/);
            const rootName = (match ? match[1] : chordRootPart) ?? 'C';

            const rootPitch = noteNameToSemitone(rootName, 3);

            // determine if chord is minor (contains 'm' after root, e.g. 'Gm')
            const isMinor = /m(?![a-zA-Z])/.test(chordRootPart) || /m(?![a-zA-Z])/.test(chordNameRaw);
            const startBeat = barIndex * beatsPerBar;
            const durationBeats = beatsPerBar; // hold for full bar
            notes.push(...generateChord(rootPitch, baseVelocity, isMinor, startBeat, durationBeats));
        }

        return notes;
    }

};
