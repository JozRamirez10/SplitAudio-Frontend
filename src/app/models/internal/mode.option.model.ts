import { GuitarMode } from "../../enums/separation.guitar.mode.enum";
import { SeparationMode } from "../../enums/separation.mode.enum";
import { OrchestratorRequest } from "../dtos/orchestrator.model";

export type BooleanTrackKey = 'includeBass' | 'includePiano';
export type ModeTrackKey = Exclude<keyof OrchestratorRequest, BooleanTrackKey>

export interface ModeOption<T> {
    readonly value: T,
    readonly label: string,
    readonly description: string;
    readonly estimatedMinutes?: number;
}

export interface ToggleTrackConfig {
    readonly key: BooleanTrackKey;
    readonly title: string;
    readonly subtitle: string;
    readonly estimatedMinutes?: number;
}

export interface ModeGroupConfig<K extends ModeTrackKey = ModeTrackKey> {
    readonly key: K;
    readonly title: string;
    readonly fourColumns?: boolean;
    readonly options: readonly ModeOption<SeparationMode | GuitarMode>[];
}