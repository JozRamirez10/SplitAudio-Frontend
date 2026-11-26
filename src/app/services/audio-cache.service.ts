import { Injectable } from '@angular/core';
import { APP } from '../constants/constants';
import { DAW_CACHE, DAW_MESSAGES } from '../constants/daw.constants';

@Injectable({
    providedIn: 'root'
})
export class AudioCacheService {

    private readonly isCacheSupported = typeof window !== 'undefined' && 'caches' in window;
    private cachePromise: Promise<Cache> | null = null;

    async fetchTrackAudioBuffer(
        songId: string,
        trackId: string,
        previewUrl: string,
        signal?: AbortSignal
    ): Promise<ArrayBuffer> {

        const cacheKey = this.buildCacheKey(songId, trackId);

        const cachedBuffer = await this.readFromCache(cacheKey);
        if (cachedBuffer) {
            return cachedBuffer;
        }

        const networkResponse = await this.fetchFromNetwork(previewUrl, signal);
        await this.writeToCache(cacheKey, networkResponse);

        return networkResponse.arrayBuffer();
    }

    async clearSongCache(songId: string): Promise<void> {
        const cache = await this.openCache();
        if (!cache) return;

        try {
            const keys = await cache.keys();
            const songPrefix = this.buildSongPrefix(songId);

            await Promise.all(
                keys
                    .filter(request => request.url.startsWith(songPrefix))
                    .map(request => cache.delete(request))
            );
        } catch {}
    }

    private async openCache(): Promise<Cache | null> {
        if (!this.isCacheSupported) return null;

        try {
            this.cachePromise ??= caches.open(APP.AUDIO_CACHE_NAME);
            return await this.cachePromise;
        } catch {
            this.cachePromise = null;
            return null;
        }
    }

    private async readFromCache(cacheKey: string): Promise<ArrayBuffer | null> {
        const cache = await this.openCache();
        if (!cache) return null;

        try {
            const cachedResponse = await cache.match(cacheKey);
            return cachedResponse ? await cachedResponse.arrayBuffer() : null;
        } catch {
            return null;
        }
    }

    private async writeToCache(cacheKey: string, response: Response): Promise<void> {
        const cache = await this.openCache();
        if (!cache) return;

        try {
            await cache.put(cacheKey, response.clone());
        } catch {}
    }

    private async fetchFromNetwork(url: string, signal?: AbortSignal): Promise<Response> {
        const response = await fetch(url, { mode: DAW_CACHE.FETCH_MODE, signal });
        if (!response.ok) {
            throw new Error(`${DAW_MESSAGES.FETCH_PREVIEW_HTTP_ERROR} ${response.status}`);
        }
        return response;
    }

    private buildSongPrefix(songId: string): string {
        return `${DAW_CACHE.BASE_URL}/${songId}/`;
    }

    private buildCacheKey(songId: string, trackId: string): string {
        return `${this.buildSongPrefix(songId)}${DAW_CACHE.TRACKS_SEGMENT}/${trackId}.${DAW_CACHE.PREVIEW_EXTENSION}`;
    }
}