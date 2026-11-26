import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { API_ROUTES } from "../constants/constants";
import { SongTrack } from "../models/dtos/song.track.model";

@Injectable({
    providedIn: 'root'
})
export class DownloadService {
    
    downloadSingleTrack(track: SongTrack): void {
        this.triggerDirectDownload(track.presignedUrl);
    }
    
    downloadAllTracksAsZip(songId: string): void {
        const url = `${environment.apiUrl}${API_ROUTES.SONG}/${songId}${API_ROUTES.DOWNLOAD_ZIP}`;
        this.triggerDirectDownload(url);
    }

    private triggerDirectDownload(url: string): void {
        if (!url) return;
        
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}