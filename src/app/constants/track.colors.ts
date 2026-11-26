export interface TrackColorTheme {
    waveHex: string;
    accentHex: string;
    iconBg: string;
}

const DEFAULT_THEME: TrackColorTheme = {
    waveHex: '#38bdf8',   // sky-400
    accentHex: '#0ea5e9', // sky-500
    iconBg: 'rgba(56, 189, 248, 0.14)'
}

export function getTrackColorTheme(trackType: string): TrackColorTheme {
    const type = trackType.toLocaleLowerCase();

    if (type.includes('metronome')) {
        return { waveHex: '#10b981', accentHex: '#10b981', iconBg: 'rgba(16, 185, 129, 0.14)' }; // emerald
    }
    if (type.includes('drums')) {
        return { waveHex: '#f59e0b', accentHex: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.14)' }; // amber
    }
    if (type.includes('bass')) {
        return { waveHex: '#06b6d4', accentHex: '#06b6d4', iconBg: 'rgba(6, 182, 212, 0.14)' };   // cyan
    }
    if (type.includes('guitar')) {
        return { waveHex: '#6366f1', accentHex: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.16)' }; // indigo
    }
    if (type.includes('piano') || type.includes('key')) {
        return { waveHex: '#a855f7', accentHex: '#a855f7', iconBg: 'rgba(168, 85, 247, 0.15)' }; // purple
    }
    if (type.includes('vocal') || type.includes('chorus')) {
        return { waveHex: '#f43f5e', accentHex: '#f43f5e', iconBg: 'rgba(244, 63, 94, 0.14)' };  // rose
    }
    if (type.includes('wind')) {
        return { waveHex: '#14b8a6', accentHex: '#14b8a6', iconBg: 'rgba(20, 184, 166, 0.14)' }; // teal
    }

    return DEFAULT_THEME;
}