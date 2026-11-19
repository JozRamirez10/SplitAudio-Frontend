import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import JSZip from 'jszip';
import { firstValueFrom } from "rxjs";
import { APP } from "../constants/constants";
import { Song } from "../models/dtos/song.model";
import { SongTrack } from "../models/dtos/song.track.model";

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    private readonly http = inject(HttpClient);

    async downloadSingleTrack(songName: string, track: SongTrack): Promise<void> {
        const { blob, filename } = await this.fetchTrackFile(songName, track);
        this.triggerBrowserDownload(blob, filename);
    }

    async downloadAllTracksAsZip(song: Song): Promise<void> {
        const zip = new JSZip();
        const folder = zip.folder(song.songName);

        const tracksToPackage = song.tracks.filter(
            (track) => track.trackType.toLowerCase() !== 'original'
        );

        const downloadPromises = tracksToPackage.map(async (track) => {
            const { blob, filename } = await this.fetchTrackFile(song.songName, track);
            folder?.file(filename, blob);
        });

        await Promise.all(downloadPromises);

        const zipBlob = await zip.generateAsync({ type: APP.BLOB });
        this.triggerBrowserDownload(
            zipBlob, `${song.songName}_${song.musicalKey}_${song.tuningHz}Hz_${song.bpm}BPM.zip`
        );
    }

    private async fetchTrackFile(songName: string, track: SongTrack)
        : Promise<{ blob: Blob, filename: string}> {

        const blob = await firstValueFrom(
            this.http.get(track.presignedUrl, { responseType:  APP.BLOB })
        );
        const ext = this.extractExtension(track.presignedUrl);
        const filename = `${songName}_${track.trackType}.${ext}`;

        return { blob, filename };
    }

    private extractExtension(presignedUrl: string): string {
        const cleanUrl = presignedUrl.split('?')[0];
        return cleanUrl.split('.').pop() || 'wav';
    }

    private triggerBrowserDownload(blob: Blob, filename: string): void {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
    }

}