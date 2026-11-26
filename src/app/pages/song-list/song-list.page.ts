import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, alertCircleOutline, cloudUploadOutline, musicalNotesOutline, refreshOutline } from 'ionicons/icons';
import { ActiveJobsBadgeComponent } from '../../components/active-jobs-badge/active-jobs-badge.component';
import { SongAccordionItemComponent } from '../../components/song-accordion-item/song-accordion-item.component';
import { PAGES } from '../../constants/constants';
import { SongTrack } from '../../models/dtos/song.track.model';
import { ModalService } from '../../services/modal.service';
import { SongState } from '../../states/song.state';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.page.html',
  styleUrls: ['./song-list.page.scss'],
  imports: [
    IonContent, IonIcon, IonSpinner, SongAccordionItemComponent, ActiveJobsBadgeComponent
  ],
})
export class SongListPage implements OnInit {

  public readonly songState = inject(SongState);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);

  constructor() { 
    addIcons({ 
      addCircleOutline, refreshOutline, musicalNotesOutline, cloudUploadOutline, alertCircleOutline 
    });
  }

  ngOnInit(): void {
    this.songState.loadSongs();
  }

  goToUpload(): void {
    this.router.navigate([`/${PAGES.UPLOAD_SONG}`]);
  }

  onRefresh(): void {
    this.songState.loadSongs(true);
  }

  onDownloadTrack(track: SongTrack): void {
    this.songState.downloadTrack(track);
  }

  onDownloadZip(songId: string): void {
    this.songState.downloadSongZip(songId);
  }

  async onDeleteSong(songId: string): Promise<void> {
    const isConfirmed = await this.modalService.confirmDelete();
    if (isConfirmed) {
      this.songState.deleteSong(songId);
    }
  }
}
