import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { archiveOutline, chevronDownOutline, musicalNoteOutline, optionsOutline, trashOutline } from 'ionicons/icons';
import { Song } from '../../models/dtos/song.model';
import { SongTrack } from '../../models/dtos/song.track.model';
import { TrackItemComponent } from '../track-item/track-item.component';

@Component({
  selector: 'app-song-accordion-item',
  templateUrl: './song-accordion-item.component.html',
  styleUrls: ['./song-accordion-item.component.scss'],
  imports: [
    IonIcon, IonSpinner, TrackItemComponent
  ],
})
export class SongAccordionItemComponent {

  private readonly router = inject(Router);
  
  public readonly song = input.required<Song>();
  public readonly isDownloadingZip = input<boolean>(false);

  public readonly downloadTrack = output<{ songName: string, track: SongTrack }>();
  public readonly downloadZip = output<Song>();
  public readonly deleteSong = output<string>();

  public readonly isOpen = signal<boolean>(false);

  constructor() {
    addIcons({
      chevronDownOutline, archiveOutline, optionsOutline, trashOutline, musicalNoteOutline
    });
  }

  toggleAccordion(): void {
    this.isOpen.update(open => !open);
  }

  onDownloadZip(): void {
    this.downloadZip.emit(this.song());
  }

  onOpenDaw(): void {
    this.router.navigate(['/daw', this.song().id]);
  }

  onDeleteSong(): void {
    this.deleteSong.emit(this.song().id);
  }

  onTrackDownload(track: SongTrack): void {
    this.downloadTrack.emit({ songName: this.song().songName, track });
  }
}
