import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { DAW_AUDIO, DAW_MESSAGES } from '../constants/daw.constants';
import { SongTrack } from '../models/dtos/song.track.model';
import { DawTrackState } from '../models/internal/daw.track.model';
import { clamp, extractWaveformPeaks, isTrackSilent } from '../utils/daw.utils';
import { AudioCacheService } from './audio-cache.service';

interface LoadedTrackNodes {
    buffer: AudioBuffer;
    gainNode: GainNode;
    sourceNode: AudioBufferSourceNode | null;
}

interface DecodedTrackResult {
    track: SongTrack;
    duration: number;
    peaks: number[];
}

@Injectable()
export class AudioEngineService implements OnDestroy {

    private readonly audioCacheService = inject(AudioCacheService);

    private audioContext: AudioContext | null = null;
    private masterGainNode: GainNode | null = null;
    private readonly trackNodes = new Map<string, LoadedTrackNodes>();

    private abortController: AbortController | null = null;
    private rafId: number | null = null;
    private playbackStartAudioTime = 0;
    private playbackStartOffset = 0;
    private isDestroyed = false;

    public readonly isLoading = signal<boolean>(false);
    public readonly loadedTracksCount = signal<number>(0);
    public readonly totalTracksCount = signal<number>(0);
    public readonly loadError = signal<string | null>(null);

    public readonly isPlaying = signal<boolean>(false);
    public readonly currentTime = signal<number>(0);
    public readonly duration = signal<number>(0);
    public readonly tracks = signal<DawTrackState[]>([]);

    public readonly loadProgress = computed(() => {
        const total = this.totalTracksCount();
        return total > 0 ? Math.round((this.loadedTracksCount() / total) * 100) : 0;
    });

    public readonly hasAnySolo = computed(() =>
        this.tracks().some(t => t.isSolo)
    );

    async loadSong(songId: string, songTracks: SongTrack[]): Promise<void> {
        this.resetEngine();

        const playableTracks = this.sortTracks(songTracks.filter(t => !!t.previewUrl));
        if (playableTracks.length === 0) {
            this.loadError.set(DAW_MESSAGES.NO_PREVIEWS);
            return;
        }

        this.isLoading.set(true);
        this.totalTracksCount.set(playableTracks.length);
        this.loadedTracksCount.set(0);
        this.loadError.set(null);

        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        try {
            const ctx = this.ensureAudioContext();
            const results = await Promise.all(
                playableTracks.map(track => this.loadAndDecodeTrack(songId, track, ctx, signal))
            );

            if (this.isAborted(signal)) return;

            const decoded = results.filter((r): r is DecodedTrackResult => r !== null);
            const maxDuration = decoded.reduce((max, r) => Math.max(max, r.duration), 0);

            this.duration.set(maxDuration);
            this.tracks.set(decoded.map(({ track, peaks }) => ({
                track,
                volume: 1,
                isMuted: false,
                isSolo: false,
                peaks
            })));
            this.applyAllTrackGains();
        } catch {
            if (this.isAborted(signal)) return;
            this.loadError.set(DAW_MESSAGES.LOAD_AUDIO_ERROR);
        } finally {
            if (!this.isDestroyed) {
                this.isLoading.set(false);
            }
        }
    }

    async play(): Promise<void> {
        if (this.isLoading() || this.isPlaying() || this.trackNodes.size === 0) return;

        const ctx = this.ensureAudioContext();
        if (ctx.state === DAW_AUDIO.SUSPENDED_STATE) {
            await ctx.resume();
        }

        if (this.playbackStartOffset >= this.duration()) {
            this.playbackStartOffset = 0;
            this.currentTime.set(0);
        }

        this.startSourcesAt(this.playbackStartOffset);
        this.isPlaying.set(true);
        this.startTimeLoop();
    }

    pause(): void {
        if (!this.isPlaying()) return;

        const current = this.calculateCurrentTime();
        this.stopActiveSources();
        this.stopTimeLoop();

        this.playbackStartOffset = current;
        this.currentTime.set(current);
        this.isPlaying.set(false);
    }

    togglePlayPause(): void {
        if (this.isPlaying()) {
            this.pause();
        } else {
            void this.play();
        }
    }

    seek(targetSeconds: number): void {
        const clamped = clamp(targetSeconds, 0, this.duration());
        this.playbackStartOffset = clamped;
        this.currentTime.set(clamped);

        if (this.isPlaying()) {
            this.stopActiveSources();
            this.startSourcesAt(clamped);
        }
    }

    skip(deltaSeconds: number): void {
        this.seek(this.currentTime() + deltaSeconds);
    }

    restart(): void {
        this.seek(0);
    }

    setTrackVolume(trackId: string, volume: number): void {
        const clamped = clamp(volume, 0, 1);
        this.updateTrack(trackId, item => ({
            ...item,
            volume: clamped,
            isMuted: clamped === 0
        }));
    }

    toggleMute(trackId: string): void {
        this.updateTrack(trackId, item => {
            const nextMuted = !item.isMuted;
            return {
                ...item,
                isMuted: nextMuted,
                isSolo: nextMuted ? false : item.isSolo
            };
        });
    }

    toggleSolo(trackId: string): void {
        this.updateTrack(trackId, item => {
            const nextSolo = !item.isSolo;
            return {
                ...item,
                isSolo: nextSolo,
                isMuted: nextSolo ? false : item.isMuted
            };
        });
    }

    ngOnDestroy(): void {
        this.isDestroyed = true;
        this.resetEngine();
        if (this.audioContext) {
            void this.audioContext.close();
            this.audioContext = null;
            this.masterGainNode = null;
        }
    }

    private async loadAndDecodeTrack(
        songId: string,
        track: SongTrack,
        ctx: AudioContext,
        signal: AbortSignal
    ): Promise<DecodedTrackResult | null> {
        const arrayBuffer = await this.audioCacheService.fetchTrackAudioBuffer(
            songId, track.id, track.previewUrl!, signal
        );
        if (this.isAborted(signal)) return null;

        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        if (this.isAborted(signal)) return null;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1;
        gainNode.connect(this.masterGainNode!);

        this.trackNodes.set(track.id, {
            buffer: audioBuffer,
            gainNode,
            sourceNode: null
        });

        this.loadedTracksCount.update(count => count + 1);

        return {
            track,
            duration: audioBuffer.duration,
            peaks: extractWaveformPeaks(audioBuffer)
        };
    }

    private isAborted(signal?: AbortSignal): boolean {
        return this.isDestroyed || Boolean(signal?.aborted);
    }

    private updateTrack(trackId: string, updater: (item: DawTrackState) => DawTrackState): void {
        this.tracks.update(list =>
            list.map(item => (item.track.id === trackId ? updater(item) : item))
        );
        this.applyAllTrackGains();
    }

    private ensureAudioContext(): AudioContext {
        if (!this.audioContext) {
            const AudioCtx = window.AudioContext
                || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            this.audioContext = new AudioCtx();
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = 1;
            this.masterGainNode.connect(this.audioContext.destination);
        }
        return this.audioContext;
    }

    private startSourcesAt(offsetSeconds: number): void {
        const ctx = this.audioContext;
        if (!ctx) return;

        const scheduledStart = ctx.currentTime + DAW_AUDIO.START_LOOKAHEAD_SEC;
        this.playbackStartAudioTime = scheduledStart;
        this.playbackStartOffset = offsetSeconds;

        for (const nodeEntry of this.trackNodes.values()) {
            if (offsetSeconds >= nodeEntry.buffer.duration) {
                nodeEntry.sourceNode = null;
                continue;
            }

            const source = ctx.createBufferSource();
            source.buffer = nodeEntry.buffer;
            source.connect(nodeEntry.gainNode);
            source.start(scheduledStart, offsetSeconds);
            nodeEntry.sourceNode = source;
        }
    }

    private stopActiveSources(): void {
        for (const nodeEntry of this.trackNodes.values()) {
            if (!nodeEntry.sourceNode) continue;

            try {
                nodeEntry.sourceNode.stop();
                nodeEntry.sourceNode.disconnect();
            } catch {}
            nodeEntry.sourceNode = null;
        }
    }

    private applyAllTrackGains(): void {
        const ctx = this.audioContext;
        if (!ctx) return;

        const anySolo = this.hasAnySolo();
        const now = ctx.currentTime;

        for (const item of this.tracks()) {
            const nodeEntry = this.trackNodes.get(item.track.id);
            if (!nodeEntry) continue;

            const targetGain = isTrackSilent(item, anySolo) ? 0 : item.volume;
            nodeEntry.gainNode.gain.setTargetAtTime(targetGain, now, DAW_AUDIO.GAIN_RAMP_SEC);
        }
    }

    private startTimeLoop(): void {
        this.stopTimeLoop();

        const tick = () => {
            if (!this.isPlaying() || this.isDestroyed) return;

            const elapsed = this.calculateCurrentTime();
            if (elapsed >= this.duration()) {
                this.stopActiveSources();
                this.stopTimeLoop();
                this.playbackStartOffset = 0;
                this.currentTime.set(0);
                this.isPlaying.set(false);
                return;
            }

            this.currentTime.set(elapsed);
            this.rafId = requestAnimationFrame(tick);
        };

        this.rafId = requestAnimationFrame(tick);
    }

    private stopTimeLoop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    private calculateCurrentTime(): number {
        if (!this.audioContext || !this.isPlaying()) {
            return this.playbackStartOffset;
        }
        const delta = Math.max(0, this.audioContext.currentTime - this.playbackStartAudioTime);
        return Math.min(this.playbackStartOffset + delta, this.duration());
    }

    private resetEngine(): void {
        this.abortController?.abort();
        this.abortController = null;

        this.stopTimeLoop();
        this.stopActiveSources();

        for (const nodeEntry of this.trackNodes.values()) {
            nodeEntry.gainNode.disconnect();
        }
        this.trackNodes.clear();

        this.playbackStartOffset = 0;
        this.playbackStartAudioTime = 0;
        this.isPlaying.set(false);
        this.currentTime.set(0);
        this.duration.set(0);
        this.tracks.set([]);
    }

    private sortTracks(tracks: SongTrack[]): SongTrack[] {
        return [...tracks].sort((a, b) => {
            const orderA = this.getTrackOrderWeight(a.trackType);
            const orderB = this.getTrackOrderWeight(b.trackType);
            return orderA !== orderB ? orderA - orderB : a.trackType.localeCompare(b.trackType);
        });
    }

    private getTrackOrderWeight(trackType: string): number {
        const normalized = trackType.toLowerCase();
        const index = DAW_AUDIO.TRACK_ORDER.findIndex(prefix => normalized.startsWith(prefix));
        return index === -1 ? DAW_AUDIO.TRACK_ORDER.length - 1 : index;
    }
}