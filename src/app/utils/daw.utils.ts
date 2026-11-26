import { DAW_AUDIO, DAW_UI } from '../constants/daw.constants';
import { TRACK_LABELS } from '../constants/track.labels';
import { DawTrackState } from '../models/internal/daw.track.model';

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return DAW_UI.DEFAULT_TIME_LABEL;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function readInputNumber(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
}

export function isMetronomeTrack(trackType: string): boolean {
    return trackType.toLowerCase().includes(DAW_UI.METRONOME_KEY);
}

export function getTrackLabel(trackType: string): string {
    return TRACK_LABELS[trackType.toLowerCase()] || trackType;
}

export function getTrackIcon(trackType: string): string {
    const normalized = trackType.toLowerCase();
    if (isMetronomeTrack(normalized)) return DAW_UI.ICON_METRONOME;
    if (normalized === DAW_UI.ORIGINAL_KEY) return DAW_UI.ICON_ORIGINAL;
    return DAW_UI.ICON_INSTRUMENT;
}

export function isTrackSilent(item: DawTrackState, hasAnySolo: boolean): boolean {
    return item.isMuted || (hasAnySolo && !item.isSolo);
}

export function getRulerStepSeconds(durationSeconds: number): number {
    if (durationSeconds <= 60) return 5;
    if (durationSeconds <= 180) return 15;
    if (durationSeconds > 420) return 60;
    return 30;
}

export function extractWaveformPeaks(
    buffer: AudioBuffer,
    barsCount: number = DAW_AUDIO.WAVEFORM_PEAKS_COUNT
): number[] {
    const channelCount = buffer.numberOfChannels;
    const totalSamples = buffer.length;

    if (totalSamples === 0 || channelCount === 0) return [];

    const channels = Array.from({ length: channelCount }, (_, ch) => buffer.getChannelData(ch));
    const samplesPerBar = Math.max(1, Math.floor(totalSamples / barsCount));
    const stride = Math.max(1, Math.floor(samplesPerBar / DAW_AUDIO.PEAK_STRIDE_DIVISOR));
    const rawPeaks = new Float32Array(barsCount);
    let maxPeak = 0;

    for (let i = 0; i < barsCount; i++) {
        const start = i * samplesPerBar;
        const end = Math.min(start + samplesPerBar, totalSamples);
        let peak = 0;

        for (let s = start; s < end; s += stride) {
            let sum = 0;
            for (let ch = 0; ch < channelCount; ch++) {
                sum += Math.abs(channels[ch][s]);
            }
            const avg = sum / channelCount;
            if (avg > peak) peak = avg;
        }

        rawPeaks[i] = peak;
        if (peak > maxPeak) maxPeak = peak;
    }

    const normalizer = maxPeak > DAW_AUDIO.MIN_NORMALIZER_PEAK ? maxPeak : 1;
    return Array.from(rawPeaks, p => p / normalizer);
}