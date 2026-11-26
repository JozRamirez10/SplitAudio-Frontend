import { SongTrack } from "../dtos/song.track.model";

export interface DawTrackState {
    track: SongTrack;
    volume: number;
    isMuted: boolean;
    isSolo: boolean;
    peaks: number[];
}