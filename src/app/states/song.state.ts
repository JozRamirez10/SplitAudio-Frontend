import { HttpErrorResponse } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, filter, finalize, from, Observable, of, retry, switchMap, take, tap, throwError, timer } from "rxjs";
import { environment } from "../../environments/environment";
import { APP, MESSAGE_ERROR } from "../constants/constants";
import { JobStatus } from "../enums/job.status.enum";
import { ModalActions } from "../enums/modal.actions.enum";
import { JobStatusResponse, JobSubmissionResponse, OrchestratorRequest, OrchestratorResponse } from "../models/dtos/orchestrator.model";
import { Song } from "../models/dtos/song.model";
import { SongTrack } from "../models/dtos/song.track.model";
import { DownloadService } from "../services/download.service";
import { ModalService } from "../services/modal.service";
import { OrchestratorService } from "../services/orchestrator.service";
import { SongService } from "../services/song.service";

@Injectable({
    providedIn: 'root'
})
export class SongState {

    private readonly songService = inject(SongService);
    private readonly orchestratorService = inject(OrchestratorService);
    private readonly downloadService = inject(DownloadService);
    private readonly modalService = inject(ModalService);

    public readonly currentUserEmail = signal<string>(environment.defaultUserEmail);
    public readonly songs = signal<Song[]>([]);
    public readonly isLoading = signal<boolean>(false);
    public readonly isProcessing = signal<boolean>(false);
    public readonly downloadingSongId = signal<string | null> (null);
    public readonly errorMessage = signal<string | null>(null);

    public readonly totalSongs = computed(() => this.songs().length);

    public readonly currentJobStatus = signal<JobStatusResponse | null>(null);

    loadSongs(forceReload: boolean = false): void {
        if (!forceReload && this.songs().length > 0) {
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.songService.findSongByUserEmail(this.currentUserEmail()).pipe(
            retry(APP.RETRY),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (songs: Song[]) => {
                this.songs.set(songs);
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage.set(MESSAGE_ERROR.LOAD_SONGS);
            }
        });
    }

    processNewSong(file: File, tracksConfig: OrchestratorRequest) {
        return this.handleProcessPolling(
            this.orchestratorService.splitAudio(file, this.currentUserEmail(), tracksConfig)
        )
    }

    processYoutubeSong(url: string, tracksConfig: OrchestratorRequest) {
        return this.handleProcessPolling(
            this.orchestratorService.splitYoutube(url, this.currentUserEmail(), tracksConfig)
        )   
    }

    private handleProcessPolling(jobSubmission$: Observable<JobSubmissionResponse>)
        : Observable<OrchestratorResponse> {
        
        this.isProcessing.set(true);

        return jobSubmission$.pipe(
            switchMap(submission => {

                this.currentJobStatus.set({
                    jobId: submission.jobId,
                    status: submission.status,
                    jobsAhead: 0
                });

                return timer(0, 5000).pipe(
                    switchMap(() => this.orchestratorService.getJobStatus(submission.jobId)),
                    tap(statusRes => this.currentJobStatus.set(statusRes)),
                    filter(statusRes =>
                        statusRes.status === JobStatus.COMPLETED || 
                        statusRes.status === JobStatus.FAILED || 
                        statusRes.status === JobStatus.NOT_FOUND
                    ),
                    take(1),
                    switchMap(finalRes => {
                        if (finalRes.status === JobStatus.COMPLETED 
                            && finalRes.orchestratorDtoResponse) {
                            return of(finalRes.orchestratorDtoResponse);
                        } else {
                            return throwError(() => new Error(`Status Job: ${finalRes.status}`));
                        }
                    })
                );
            }),
            tap (() => {
                this.loadSongs(true);
            }),
            catchError((err: HttpErrorResponse) => {
                this.modalService.showModal(ModalActions.CUSTOM, '', MESSAGE_ERROR.PROCESS_SONG);
                return throwError(() => err);
            }),
            finalize(() => {
                this.isProcessing.set(false);
                this.currentJobStatus.set(null);
            })
        );
    }

    deleteSong(songId: string): void {
        
        this.isLoading.set(true);

        this.songService.deleteSong(songId).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: () => {
                this.songs.update(currentSongs => currentSongs.filter(s => s.id !== songId));
                this.modalService.showModal(ModalActions.DELETE_SUCCESS);
            },
            error: (err: HttpErrorResponse) => {
                this.modalService.showModal(ModalActions.ERROR_DELETE);
            }
        });
    }

    downloadTrack(songName: string, track: SongTrack): void {
        from(this.downloadService.downloadSingleTrack(songName, track)).subscribe({
            error: () => this.modalService.showModal(
                ModalActions.CUSTOM, `${MESSAGE_ERROR.DOWNLOAD_TRACK} ${track.trackType}` 
            )
        });
    }

    downloadSongZip(song: Song): void {
        this.downloadingSongId.set(song.id);

        from(this.downloadService.downloadAllTracksAsZip(song)).pipe(
            finalize(() => this.downloadingSongId.set(null))
        ).subscribe({
            error: () => this.modalService.showModal(
                ModalActions.CUSTOM, '', `${MESSAGE_ERROR.DOWNLOAD_SONG_ZIP} ${song.songName}`
            )
        });
    }
}