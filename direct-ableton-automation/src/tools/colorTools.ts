// src/tools/colorTools.ts
/**
 * Parse an RGB hex color string into a 24-bit integer in the form 0x00rrggbb.
 * Accepts "#rrggbb", "rrggbb", or "0xrrggbb" (case-insensitive).
 * Returns null for invalid input.
 */
export function parseNamedColorToInt(color?: string): number | null {
    const hex = colorNameToHex(color)
    if (!hex) return null;
    let s = hex.trim().toLowerCase();
    if (s.startsWith('#')) s = s.slice(1);
    if (s.startsWith('0x')) s = s.slice(2);
    if (!/^[0-9a-f]{6}$/.test(s)) return null;
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return (r << 16) + (g << 8) + b;
}



// kept as a named export only; no default export

// Common named colors map (hex strings in #rrggbb format)
const NAMED_COLORS: Record<string, string> = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    white: '#ffffff',
    black: '#000000',
    yellow: '#ffff00',
    orange: '#ffa500',
    purple: '#800080',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    gray: '#808080',
    brown: '#a52a2a',
    pink: '#ffc0cb',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
};

/**
 * Map a common color name to a hex RGB string in the form "#rrggbb".
 * Returns null when the name is unknown.
 * Supported (common) colors: red, green, blue, white, black.
 */
function colorNameToHex(name?: string): string | null {
    if (!name) return null;
    const key = name.trim().toLowerCase();
    return NAMED_COLORS[key] ?? null;
}

// parseNamedColorToInt is exported via its declaration above
