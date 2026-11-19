import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, documentTextOutline, logoYoutube, sparklesOutline } from 'ionicons/icons';
import { ActiveJobsBadgeComponent } from '../../components/active-jobs-badge/active-jobs-badge.component';
import { FileDropzoneComponent } from '../../components/file-dropzone/file-dropzone.component';
import { ProcessingProgressComponent } from '../../components/processing-progress/processing-progress.component';
import { TrackConfigSelectorComponent } from '../../components/track-config-selector/track-config-selector.component';
import { UrlInputComponent } from '../../components/url-input/url-input.component';
import { APP, GENERAL, MESSAGE_LOADING, PAGES } from '../../constants/constants';
import { TRACK_MODE_GROUPS } from '../../constants/instruments.options';
import { DEFAULT_ORCHESTRATOR_REQUEST_CONFIG } from '../../constants/orchestrator.default.config';
import { GuitarMode } from '../../enums/separation.guitar.mode.enum';
import { SeparationMode } from '../../enums/separation.mode.enum';
import { SongInputType } from '../../enums/song.input.type.enum';
import { OrchestratorRequest } from '../../models/dtos/orchestrator.model';
import { YoutubeMetadata } from '../../models/internal/metadata.youtube.model';
import { SongState } from '../../states/song.state';

@Component({
  selector: 'app-song-upload',
  templateUrl: './song-upload.page.html',
  styleUrls: ['./song-upload.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    FileDropzoneComponent,
    TrackConfigSelectorComponent,
    UrlInputComponent,
    ProcessingProgressComponent,
    ActiveJobsBadgeComponent
  ],
})
export class SongUploadPage {

  private readonly router = inject(Router);
  public readonly songState = inject(SongState);

  public readonly SongInputType = SongInputType;

  public readonly inputType = signal<SongInputType>(SongInputType.FILE);
  public readonly selectedFile = signal<File | null>(null);

  public readonly youtubeUrl = signal<string>(GENERAL.EMPTY_STRING);
  public readonly youtubeMetadata = signal<YoutubeMetadata | null>(null);

  public readonly trackConfig = signal<OrchestratorRequest>({ 
    ...DEFAULT_ORCHESTRATOR_REQUEST_CONFIG 
  });

  public readonly hasAtLeastOneTrack = computed(() => {
    const config = this.trackConfig();
    return (
      config.includeBass || config.includePiano ||
      config.drumsMode !== SeparationMode.NONE ||
      config.guitarMode !== GuitarMode.NONE ||
      config.vocalsMode !== SeparationMode.NONE ||
      config.windsMode !== SeparationMode.NONE
    );
  });

  public readonly canSubmit = computed(() =>{
    const isConfigValid = this.hasAtLeastOneTrack() && !this.songState.isProcessing();

    if (this.inputType() === SongInputType.FILE) {
      return !!this.selectedFile() && isConfigValid;
    } else {
      return !!this.youtubeMetadata() && isConfigValid;
    }
  });
  
  public readonly estimatedTotalTime = computed(() => {
    if (!this.hasAtLeastOneTrack()){
      return 0;
    }

    let total = APP.BASE_PROCESSING_MINUTES + (this.inputType() !== SongInputType.FILE ? 2 : 0);
    const config = this.trackConfig();

    for (const group of TRACK_MODE_GROUPS) {
      const selectedValue = config[group.key];
      
      if (selectedValue === SeparationMode.GENERAL || selectedValue === SeparationMode.NONE) {
        continue;
      }

      const selectedOption = group.options.find(opt => opt.value === selectedValue);
      if (selectedOption?.estimatedMinutes) {
        total += selectedOption.estimatedMinutes;
      }
    }

    return total;
  });

  public readonly showProgressScreen = signal<boolean>(false);

  constructor() {
    addIcons({ arrowBackOutline, sparklesOutline, documentTextOutline, logoYoutube });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.songState.isProcessing()) {
      $event.preventDefault();
      $event.returnValue = MESSAGE_LOADING.NOTIFICATION_BEFORE_EXIT;
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  } 

  onFileRemoved(): void {
    this.selectedFile.set(null);
  }

  onYoutubeDataLoaded(data: { url: string, metadata: YoutubeMetadata | null }): void {
    this.youtubeUrl.set(data.url);
    this.youtubeMetadata.set(data.metadata);
  }

  onSubmit(): void {

    if (!this.canSubmit()) {
      return;
    }

    this.showProgressScreen.set(true);

    const processObservable = this.inputType() === SongInputType.FILE
      ? this.songState.processNewSong(this.selectedFile()!, this.trackConfig())
      : this.songState.processYoutubeSong(this.youtubeUrl(), this.trackConfig());

    processObservable.subscribe({
      next: () => {
        setTimeout(() => {
          this.router.navigate([`/${PAGES.SONGS}`]).then(() => {
            this.resetForm();
            this.showProgressScreen.set(false);
          })
        }, 800);
      },
      error: () => {
        this.showProgressScreen.set(false);
      }
    });
  }

  goBack(): void {
    this.resetForm();
    this.router.navigate([`/${PAGES.SONGS}`]);
  }

  private resetForm(): void {
    this.selectedFile.set(null);
    this.youtubeUrl.set(GENERAL.EMPTY_STRING);
    this.youtubeMetadata.set(null);

    this.inputType.set(SongInputType.FILE);
    this.trackConfig.set({ ...DEFAULT_ORCHESTRATOR_REQUEST_CONFIG });
  }
}
