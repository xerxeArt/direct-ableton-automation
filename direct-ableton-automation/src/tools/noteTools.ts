import { Note } from "../types.js";
import { jiggleAroundPercentage } from "./randomTools.js";

export function velocityForIntensity(i: number): number {
    // map intensity 0..1 to base velocity range 70..120
    return Math.round(70 + i * 50);
}

export function noteNameToSemitone(noteName: string, baseOctaveMidi: number): number {
    const norm = noteName.trim().toUpperCase();
    // handle accidental like Bb, C#, E#, etc.
    const map: Record<string, number> = {
        'C': 0, 'B#': 0,
        'C#': 1, 'DB': 1,
        'D': 2,
        'D#': 3, 'EB': 3,
        'E': 4, 'FB': 4,
        'F': 5, 'E#': 5,
        'F#': 6, 'GB': 6,
        'G': 7,
        'G#': 8, 'AB': 8,
        'A': 9,
        'A#': 10, 'BB': 10,
        'B': 11, 'CB': 11
    };

    return (map[norm] ?? 0) + (baseOctaveMidi * 12);
};

export function generateChord(rootPitch: number, baseVelocity: number, isMinor: boolean,
    durationBeats: number
): Array<Note> {
    const chord: Array<Note> = [];
    const third = isMinor ? 3 : 4;
    const fifth = 7;
    const octave = 12;
    const startBeat: number = 0;

    const velBase = jiggleAroundPercentage(baseVelocity, 10);
    const velFifth = jiggleAroundPercentage(baseVelocity, 10, true);
    const velThird = jiggleAroundPercentage(baseVelocity, 20);
    const velOctave = jiggleAroundPercentage(baseVelocity, 25);

    chord.push({ pitch: rootPitch, startTimeBeats: startBeat, durationBeats, velocity: velBase });
    chord.push({ pitch: rootPitch + third, startTimeBeats: startBeat, durationBeats, velocity: velThird });
    chord.push({ pitch: rootPitch + fifth, startTimeBeats: startBeat, durationBeats, velocity: velFifth });
    chord.push({ pitch: rootPitch + octave, startTimeBeats: startBeat, durationBeats, velocity: velOctave });


    return chord;
}
