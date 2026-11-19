import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_ROUTES, GENERAL } from '../constants/constants';
import { Song } from '../models/dtos/song.model';

@Injectable({
    providedIn: 'root'
})
export class SongService {

    private readonly http = inject(HttpClient)
    private readonly apiUrl = `${environment.apiUrl}${API_ROUTES.SONG}`;

    findSongById(id: string): Observable<Song> {
        return this.http.get<Song>(`${this.apiUrl}/${id}`);
    }

    findSongByUserEmail(userEmail: string): Observable<Song[]> {
        const params = new HttpParams().set(GENERAL.USER_EMAIL, userEmail);
        return this.http.get<Song[]>(this.apiUrl, { params });
    }

    deleteSong(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
