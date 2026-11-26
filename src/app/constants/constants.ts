import { SpinnerTypes } from "@ionic/angular";

export const APP = {
    RETRY: 2,
    APP_JSON: 'application/json',
    ALLOWED_EXTENSIONS: ['.mp3', '.wav', '.flac', '.m4a', '.ogg'] as readonly string[],
    MAX_FILE_SIZE_MB: 200,
    BASE_PROCESSING_MINUTES: 2,
    YOUTUBE_REGEX: /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/ ,
    NOEMBED_URL: 'https://noembed.com/embed?url=',
    GROUP_MAINTENANCE: [] as readonly string[],
    AUDIO_CACHE_NAME: 'splitaudio-previews'
} as const;

export const GENERAL = {
    USER_EMAIL: 'userEmail',
    EMAIL: 'email',
    FILE: 'file',
    TRACKS: 'tracks',
    URL: 'url',
    EMPTY_STRING: '',
    FULL: 'full',
} as const;

export const API_ROUTES = {
    SONG: '/songs',
    ORCHESTRATOR: '/orchestrator',
    SPLIT_AUDIO: "/split-audio/job",
    SPLIT_YOUTUBE: "/split-youtube/job",
    JOB_BY_ID: "/jobs/status",
    ACTIVE_JOBS: "/jobs/active",
    DOWNLOAD_ZIP: "/download-zip"
} as const;

export const PAGES = {
    SONGS: 'songs',
    UPLOAD_SONG: 'upload',
    DAW: 'daw'
} as const

export const MESSAGE_LOADING = {
    PHASE1: "Preparando el entorno...",
    PHASE2: "Subiendo archivo al servidor de Split Audio...",
    PHASE3: "Aislando frecuencias y preparando modelos IA...",
    PHASE4: "Separando stems (esto tomará un momento)...",
    PHASE5: "Limpiando ruido y generando pistas individuales...",
    PHASE6: "Analizando BPM y construyendo pista de metrónomo...",
    LOAD_SUCCESS: "¡Proceso completado con éxito!",
    NOTIFICATION_BEFORE_EXIT: "La canción se está procesando. Si sales, podrías perder el progreso."
} as const;

export const MESSAGE_ERROR = {
    LOAD_SONGS: 'Ha ocurrido un error al cargas las canciones. Refresca la página.',
    PROCESS_SONG: 'Ocurrió un error al procesar la canción. ' +
        'Vuelva a intentarlo o póngase en contacto con el administrador.',
    DELETE_SONG: 'Error al eliminar la canción.'
} as const;

export const APP_UI = {
    OK: 'Aceptar',
    CANCEL: 'Cancelar'
} as const;

export const SPINNERS: Record<string, SpinnerTypes> = {
    CRESCENT: 'crescent',
    CIRCLES: 'circles'
};

export const TOAST = {
  DURATION: 3000,
  TOP_POSITION: 'top' as const,
  COLOR_SUCCESS: 'success',
  COLOR_ERROR: 'danger',
  COLOR_DEFAULT: 'primary',
  CSS_CLASS: 'custom-toast'
};

export const ALERTS = {
  DELETE_TITLE: 'Eliminar Canción',
  DELETE_MESSAGE: '¿Estás seguro de que deseas eliminar esta canción y todas sus pistas? Esta acción no se puede deshacer.',
  CONFIRM_DELETE: 'Sí, eliminar',
  ROLE_CANCEL: 'cancel',
  ROLE_CONFIRM: 'confirm',
  CSS_CLASS_CANCEL: 'alert-btn-cancel',
  CSS_CLASS_CONFIRM: 'alert-btn-danger'
};

export const MODAL_TITLES = {
  ERROR_CONNECTION: 'Error de Conexión',
  ERROR_SERVER: 'Error del Servidor'
};

export const MODAL_MESSAGES = {
  LOADING: 'Cargando...',
  DELETE_SUCCESS: 'La canción fue eliminada de tu biblioteca.',
  ERROR_DELETE: 'Ocurrió un error al intentar eliminar la canción.',
  ERROR_SONG_LOADING: 'No pudimos cargar tu biblioteca de canciones.',
  ERROR_DOWNLOAD: 'Ocurrió un error durante la descarga.',
  ERROR_CONNECTION: 'Verifica tu conexión a la red local/internet.',
  ERROR_SERVER: 'El servidor no responde en este momento.'
};
