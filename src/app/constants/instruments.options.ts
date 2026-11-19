import { GuitarMode } from "../enums/separation.guitar.mode.enum";
import { SeparationMode } from "../enums/separation.mode.enum";
import { ModeGroupConfig, ModeOption, ToggleTrackConfig } from "../models/internal/mode.option.model";

export const DRUMS_OPTIONS: readonly ModeOption<SeparationMode>[] = [
  { value: SeparationMode.NONE, label: 'Omitir', description: 'Sin batería' },
  { value: SeparationMode.GENERAL, label: 'Pista General', description: '1 stem completo', estimatedMinutes: 0.3 },
  { value: SeparationMode.INDIVIDUAL, label: '6 Pistas Individuales', description: 'Kick, Snare, Toms, Hi-Hat, Ride, Crash', estimatedMinutes: 8 },
];

export const GUITAR_OPTIONS: readonly ModeOption<GuitarMode>[] = [
  { value: GuitarMode.NONE, label: 'Omitir', description: 'Sin guitarras' },
  { value: GuitarMode.GENERAL, label: 'Pista General', description: '1 stem completo', estimatedMinutes: 0.3 },
  { value: GuitarMode.BY_ROLE, label: 'Por Rol', description: 'Rhythm + Lead', estimatedMinutes: 1 },
  { value: GuitarMode.BY_TYPE, label: 'Por Tipo', description: 'Acoustic + Electric', estimatedMinutes: 1 },
];

export const VOCALS_OPTIONS: readonly ModeOption<SeparationMode>[] = [
  { value: SeparationMode.NONE, label: 'Omitir', description: 'Sin voces' },
  { value: SeparationMode.GENERAL, label: 'Pista General', description: '1 stem vocal', estimatedMinutes: 0.3 },
  { value: SeparationMode.INDIVIDUAL, label: 'Separar Coros', description: 'Lead Vocals + Chorus', estimatedMinutes: 6 },
];

export const WINDS_OPTIONS: readonly ModeOption<SeparationMode>[] = [
  { value: SeparationMode.NONE, label: 'Omitir', description: 'Sin pista Other' },
  { value: SeparationMode.GENERAL, label: 'Other General', description: 'Acompañamiento general', estimatedMinutes: 0.3 },
  { value: SeparationMode.INDIVIDUAL, label: 'Extraer Vientos', description: 'Separa Winds + Other limpio', estimatedMinutes: 2 },
];

export const TRACK_TOGGLE_OPTIONS: readonly ToggleTrackConfig[] = [
  {
    key: 'includeBass',
    title: 'Bajo (Bass)',
    subtitle: 'Extraer línea de bajo con Demucs',
    estimatedMinutes: 0.3
  },
  {
    key: 'includePiano',
    title: 'Piano / Teclados',
    subtitle: 'Extraer pista armónica de piano',
    estimatedMinutes: 0.3
  },
];

export const TRACK_MODE_GROUPS: readonly ModeGroupConfig[] = [
  { key: 'drumsMode', title: 'Batería (Drums)', options: DRUMS_OPTIONS },
  { key: 'guitarMode', title: 'Guitarras (Guitars)', fourColumns: true, options: GUITAR_OPTIONS },
  { key: 'vocalsMode', title: 'Voces (Vocals)', options: VOCALS_OPTIONS },
  { key: 'windsMode', title: 'Vientos y Otros (Winds & Other)', options: WINDS_OPTIONS },
];