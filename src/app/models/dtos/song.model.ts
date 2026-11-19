import { SongTrack } from "./song.track.model";

export interface Song {
    id: string;
    userEmail: string;
    songName: string;
    bpm: number;
    tuningHz: number;
    musicalKey: string;
    createdAt: string;
    tracks: SongTrack[];
}