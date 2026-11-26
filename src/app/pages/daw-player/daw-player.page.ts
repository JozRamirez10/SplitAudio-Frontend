import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFooter, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBackOutline, refreshOutline } from 'ionicons/icons';
import { DawDesktopTimelineComponent } from '../../components/daw-desktop-timeline/daw-desktop-timeline.component';
import { DawHeaderComponent } from '../../components/daw-header/daw-header.component';
import { DawTrackRowComponent } from '../../components/daw-track-row/daw-track-row.component';
import { DawTransportBarComponent } from '../../components/daw-transport-bar/daw-transport-bar.component';
import { PAGES } from '../../constants/constants';
import { DAW_AUDIO, DAW_MESSAGES, DAW_UI } from '../../constants/daw.constants';
import { DawShortcutKey } from '../../enums/daw.shortcut.enum';
import { Song } from '../../models/dtos/song.model';
import { SongTrack } from '../../models/dtos/song.track.model';
import { AudioEngineService } from '../../services/audio-engine.service';
import { SongService } from '../../services/song.service';
import { SongState } from '../../states/song.state';

@Component({
  selector: 'app-daw-player',
  templateUrl: './daw-player.page.html',
  styleUrls: ['./daw-player.page.scss'],
  providers: [AudioEngineService],
  imports: [
    IonContent,
    IonFooter,
    IonIcon,
    IonSpinner,
    DawHeaderComponent,
    DawTrackRowComponent,
    DawDesktopTimelineComponent,
    DawTransportBarComponent,
  ],
  host: {
    '(window:keydown)': 'onKeyDown($event)'
  }
})
export class DawPlayerPage implements OnInit {

  public readonly audioEngine = inject(AudioEngineService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly songState = inject(SongState);
  private readonly songService = inject(SongService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly song = signal<Song | null>(null);
  public readonly isFetchingSong = signal<boolean>(false);
  public readonly songError = signal<string | null>(null);
  public readonly isDesktop = signal<boolean>(false);

  constructor() {
    addIcons({ alertCircleOutline, arrowBackOutline, refreshOutline });
    this.setupResponsiveListener();
  }

  ngOnInit(): void {
    const songId = this.route.snapshot.paramMap.get(DAW_UI.ROUTE_PARAM_ID);
    if (!songId) {
      this.goBack();
      return;
    }

    this.resolveSongAndLoad(songId);
  }

  goBack(): void {
    this.router.navigate([`/${PAGES.SONGS}`]);
  }

  onRetry(): void {
    const currentSong = this.song();
    if (currentSong) {
      void this.audioEngine.loadSong(currentSong.id, currentSong.tracks);
      return;
    }

    const songId = this.route.snapshot.paramMap.get(DAW_UI.ROUTE_PARAM_ID);
    if (songId) {
      this.resolveSongAndLoad(songId);
    }
  }

  onDownloadZip(): void {
    const currentSong = this.song();
    if (!currentSong) return;

    this.songState.downloadSongZip(currentSong.id);
  }

  onDownloadTrack(track: SongTrack): void {
    this.songState.downloadTrack(track);
  }

  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && DAW_UI.IGNORED_SHORTCUT_TAGS.has(target.tagName)) {
      return;
    }

    if (this.audioEngine.isLoading() || this.audioEngine.tracks().length === 0) {
      return;
    }

    switch (event.code) {
      case DawShortcutKey.PLAY_PAUSE:
        event.preventDefault();
        this.audioEngine.togglePlayPause();
        break;
      case DawShortcutKey.SKIP_BACK:
        event.preventDefault();
        this.audioEngine.skip(-DAW_AUDIO.SKIP_SECONDS);
        break;
      case DawShortcutKey.SKIP_FORWARD:
        event.preventDefault();
        this.audioEngine.skip(DAW_AUDIO.SKIP_SECONDS);
        break;
    }
  }

  private setupResponsiveListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(DAW_UI.DESKTOP_MEDIA_QUERY);
    this.isDesktop.set(mediaQuery.matches);

    const onMediaChange = (event: MediaQueryListEvent) => {
      this.isDesktop.set(event.matches);
    };

    mediaQuery.addEventListener('change', onMediaChange);
    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', onMediaChange);
    });
  }

  private resolveSongAndLoad(songId: string): void {
    const cachedSong = this.songState.songs().find(s => s.id === songId);
    if (cachedSong) {
      this.song.set(cachedSong);
      void this.audioEngine.loadSong(cachedSong.id, cachedSong.tracks);
      return;
    }

    this.isFetchingSong.set(true);
    this.songError.set(null);

    this.songService.findSongById(songId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (fetchedSong) => {
        this.isFetchingSong.set(false);
        this.song.set(fetchedSong);
        void this.audioEngine.loadSong(fetchedSong.id, fetchedSong.tracks);
      },
      error: () => {
        this.isFetchingSong.set(false);
        this.songError.set(DAW_MESSAGES.SONG_NOT_FOUND);
      }
    });
  }
}