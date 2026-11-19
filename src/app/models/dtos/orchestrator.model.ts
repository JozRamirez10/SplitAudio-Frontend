import { JobStatus } from "../../enums/job.status.enum";
import { GuitarMode } from "../../enums/separation.guitar.mode.enum";
import { SeparationMode } from "../../enums/separation.mode.enum";
import { Song } from "./song.model";

export interface OrchestratorRequest {
    includeBass: boolean;
    includePiano: boolean;
    drumsMode: SeparationMode;
    guitarMode: GuitarMode;
    vocalsMode: SeparationMode;
    windsMode: SeparationMode;
}

export interface OrchestratorResponse {
    bucketName: string,
    song: Song;
}

export interface JobSubmissionResponse {
    jobId: string;
    status: JobStatus;
}

export interface JobStatusResponse {
    jobId: string;
    status: JobStatus;
    orchestratorDtoResponse?: OrchestratorResponse;
    jobsAhead?: number;
}

export interface ActiveJobsDtoResponse {
    actives: number;
}