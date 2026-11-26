import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { downloadOutline, musicalNoteOutline, pulseOutline, radioOutline } from 'ionicons/icons';
import { SongTrack } from '../../models/dtos/song.track.model';
import { getTrackIcon, getTrackLabel } from '../../utils/daw.utils';

@Component({
  selector: 'app-track-item',
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.scss'],
  imports: [IonIcon],
})
export class TrackItemComponent {

  public readonly track = input.required<SongTrack>();
  public readonly download = output<SongTrack>();

  public readonly displayLabel = computed(() =>
    getTrackLabel(this.track().trackType)
  );

  public readonly iconName = computed(() =>
    getTrackIcon(this.track().trackType)
  );

  constructor() {
    addIcons({ downloadOutline, musicalNoteOutline, pulseOutline, radioOutline });
  }

  onDownloadClick(): void {
    this.download.emit(this.track());
  }
}