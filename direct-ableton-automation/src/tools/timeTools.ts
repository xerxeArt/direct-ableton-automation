/**
 * Utility helpers for converting Ableton time units.
 *
 * The primary exported function is `timeBarToBeats` which converts a time expressed
 * in bars (can be fractional, e.g. 2.5 bars) into quarter-note beats. The function
 * reads the song's time signature from the provided `songAny` object rather than
 * assuming a specific signature.
 */

/** Read the time signature from a song-like object with several common access patterns. */
export async function readTimeSignature(songAny: any): Promise<{ numerator: number; denominator: number }> {
    // Try common get() accessors first (used by some LOM wrappers), then direct properties.
    const numRaw = await (songAny.get?.('signature_numerator') ?? songAny.get?.('signatureNumerator'))
        ?? songAny.signature_numerator
        ?? songAny.signatureNumerator;

    const denRaw = await (songAny.get?.('signature_denominator') ?? songAny.get?.('signatureDenominator'))
        ?? songAny.signature_denominator
        ?? songAny.signatureDenominator;

    // Fallback to sensible 4/4 if nothing is available
    const numerator = Number(numRaw) || 4;
    const denominator = Number(denRaw) || 4;

    return { numerator, denominator };
}

/**
 * Convert time expressed in bars to quarter-note beats using the song's time signature.
 *
 * Assumptions / contract:
 * - `timeBar` is a numeric value expressed in bars. It may be fractional (e.g. 1.5 = one and a half bars).
 * - The returned value is in quarter-note beats (i.e. the usual Ableton "beats" unit).
 *
 * Conversion logic:
 * - Beats per bar in quarter-note beats = numerator * (4 / denominator).
 * - total beats = timeBar * beatsPerBarInQuarter
 */
export async function timeBarToBeats(songAny: any, timeBar: number): Promise<number> {
    const { numerator, denominator } = await readTimeSignature(songAny);

    // beats per bar measured in quarter-note beats
    const beatsPerBarInQuarter = numerator * (4 / denominator);

    const tb = Number(timeBar) || 0;
    return tb * beatsPerBarInQuarter;
}

// timeBarToBeats is exported as a named function above
