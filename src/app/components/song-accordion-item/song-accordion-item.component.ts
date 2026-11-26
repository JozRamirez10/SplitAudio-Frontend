import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { archiveOutline, chevronDownOutline, musicalNoteOutline, optionsOutline, trashOutline } from 'ionicons/icons';
import { PAGES } from '../../constants/constants';
import { Song } from '../../models/dtos/song.model';
import { SongTrack } from '../../models/dtos/song.track.model';
import { TrackItemComponent } from '../track-item/track-item.component';

@Component({
  selector: 'app-song-accordion-item',
  templateUrl: './song-accordion-item.component.html',
  styleUrls: ['./song-accordion-item.component.scss'],
  imports: [
    IonIcon, TrackItemComponent
  ],
})
export class SongAccordionItemComponent {

  private readonly router = inject(Router);
  
  public readonly song = input.required<Song>();

  public readonly downloadTrack = output<SongTrack>();
  public readonly downloadZip = output<string>();
  public readonly deleteSong = output<string>();

  public readonly isOpen = signal<boolean>(false);

  public readonly hasAudioPreviews = computed(() => 
    this.song().tracks.some(track => !!track.previewUrl)
  );

  constructor() {
    addIcons({
      chevronDownOutline, archiveOutline, optionsOutline, trashOutline, musicalNoteOutline 
    });
  }

  toggleAccordion(): void {
    this.isOpen.update(open => !open);
  }

  onDownloadZip(): void {
    this.downloadZip.emit(this.song().id);
  }

  onOpenDaw(): void {
    if (!this.hasAudioPreviews()) return;
    this.router.navigate([`/${PAGES.DAW}`, this.song().id]);
  }

  onDeleteSong(): void {
    this.deleteSong.emit(this.song().id);
  }

  onTrackDownload(track: SongTrack): void {
    this.downloadTrack.emit(track);
  }
}
