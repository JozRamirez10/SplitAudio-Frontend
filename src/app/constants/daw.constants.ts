export const DAW_AUDIO = {
    WAVEFORM_PEAKS_COUNT: 700,
    PEAK_STRIDE_DIVISOR: 64,
    MIN_NORMALIZER_PEAK: 0.001,
    START_LOOKAHEAD_SEC: 0.05,
    GAIN_RAMP_SEC: 0.015,
    SKIP_SECONDS: 5,
    SUSPENDED_STATE: 'suspended',
    TRACK_ORDER: ['drums', 'bass', 'other', 'piano', 'guitar', 'vocals', 'metronome'] as readonly string[],
} as const;

export const DAW_UI = {
    DESKTOP_MEDIA_QUERY: '(min-width: 1024px)',
    ROUTE_PARAM_ID: 'id',
    DEFAULT_TIME_LABEL: '00:00',
    METRONOME_KEY: 'metronome',
    ORIGINAL_KEY: 'original',
    ICON_METRONOME: 'pulse-outline',
    ICON_ORIGINAL: 'radio-outline',
    ICON_INSTRUMENT: 'musical-note-outline',
    IGNORED_SHORTCUT_TAGS: new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']),
    RULER_MAX_VISIBLE_PERCENT: 96,   
} as const;

export const DAW_CACHE = {
    BASE_URL: 'https://splitaudio-cache.local/songs',
    TRACKS_SEGMENT: 'tracks',
    PREVIEW_EXTENSION: 'm4a',
    FETCH_MODE: 'cors' as RequestMode,
} as const;

export const WAVEFORM_STYLE = {
    DEFAULT_COLOR: '#6366f1',
    CENTER_LINE_COLOR: 'rgba(148, 163, 184, 0.14)',
    SILENT_COLOR: 'rgba(100, 116, 139, 0.4)',
    STEP_PX: 3,
    BAR_WIDTH_PX: 2,
    VERTICAL_PADDING_PX: 14,
    MIN_BAR_HALF_HEIGHT_PX: 1.5,
} as const;

export const DAW_MESSAGES = {
    NO_PREVIEWS: 'Esta canción no tiene pistas de vista previa disponibles.',
    LOAD_AUDIO_ERROR: 'No se pudieron cargar las pistas de audio. Intenta recargar.',
    SONG_NOT_FOUND: 'No se pudo encontrar la canción solicitada.',
    FETCH_PREVIEW_HTTP_ERROR: 'Error HTTP al descargar preview de audio:',
} as const;