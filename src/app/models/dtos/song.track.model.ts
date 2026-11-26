export interface SongTrack {
    id: string;
    trackType: string;
    presignedUrl: string;
    previewUrl: string | null;
}