import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { archiveOutline, arrowBackOutline, musicalNotesOutline } from 'ionicons/icons';
import { Song } from '../../models/dtos/song.model';

@Component({
  selector: 'app-daw-header',
  templateUrl: './daw-header.component.html',
  styleUrls: ['./daw-header.component.scss'],
  imports: [IonIcon],
})
export class DawHeaderComponent {

  public readonly song = input.required<Song>();
  public readonly trackCount = input<number>(0);

  public readonly back = output<void>();
  public readonly downloadZip = output<void>();

  public readonly displayTitle = computed(() => 
    this.song().songName.replace(/_/g, ' ')
  );

  constructor() {
    addIcons({ arrowBackOutline, archiveOutline, musicalNotesOutline });
  }
}
