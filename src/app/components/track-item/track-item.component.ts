import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { downloadOutline, musicalNoteOutline, pulseOutline, radioOutline } from "ionicons/icons";
import { TRACK_LABELS } from '../../constants/track.labels';
import { SongTrack } from '../../models/dtos/song.track.model';

@Component({
  selector: 'app-track-item',
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.scss'],
  imports: [
    IonIcon
  ],
})
export class TrackItemComponent {

  public readonly track = input.required<SongTrack>();
  public readonly download = output<SongTrack>();

  private readonly normalizedType = computed(() => 
    this.track().trackType.toLowerCase()
  );

  public readonly displayLabel = computed(() =>
    TRACK_LABELS[this.normalizedType()] || this.track().trackType
  );

  public readonly iconName = computed(() => {
    const type = this.normalizedType();
    if (type.includes('metronome')) return 'pulse-outline';
    if (type == 'original') return 'radio-outline';
    return 'musical-note-outline';
  });

  constructor() {
    addIcons({ downloadOutline, musicalNoteOutline, pulseOutline, radioOutline });
  }

  onDownloadClick(): void {
    this.download.emit(this.track());
  }
}
