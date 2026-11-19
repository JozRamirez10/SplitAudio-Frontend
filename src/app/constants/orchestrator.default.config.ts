import { GuitarMode } from "../enums/separation.guitar.mode.enum";
import { SeparationMode } from "../enums/separation.mode.enum";
import { OrchestratorRequest } from "../models/dtos/orchestrator.model";

export const DEFAULT_ORCHESTRATOR_REQUEST_CONFIG: OrchestratorRequest = {
    includeBass: true,
    includePiano: true,
    drumsMode: SeparationMode.GENERAL,
    guitarMode: GuitarMode.GENERAL,
    vocalsMode: SeparationMode.GENERAL,
    windsMode: SeparationMode.GENERAL
}