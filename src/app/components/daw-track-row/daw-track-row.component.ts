import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { downloadOutline, musicalNoteOutline, pulseOutline, volumeHighOutline, volumeMuteOutline } from 'ionicons/icons';
import { SongTrack } from '../../models/dtos/song.track.model';
import { DawTrackState } from '../../models/internal/daw.track.model';
import { getTrackIcon, getTrackLabel, isMetronomeTrack, isTrackSilent, readInputNumber } from '../../utils/daw.utils';

@Component({
  selector: 'app-daw-track-row',
  templateUrl: './daw-track-row.component.html',
  styleUrls: ['./daw-track-row.component.scss'],
  imports: [ IonIcon ],
})
export class DawTrackRowComponent {

  public readonly trackState = input.required<DawTrackState>();
  public readonly hasAnySolo = input<boolean>(false);

  public readonly volumeChange = output<number>();
  public readonly toggleMute = output<void>();
  public readonly toggleSolo = output<void>();
  public readonly download = output<SongTrack>();

  public readonly displayLabel = computed(() =>
    getTrackLabel(this.trackState().track.trackType)
  );

  public readonly isMetronome = computed(() =>
    isMetronomeTrack(this.trackState().track.trackType)
  );

  public readonly iconName = computed(() =>
    getTrackIcon(this.trackState().track.trackType)
  );

  public readonly volumePercent = computed(() =>
    Math.round(this.trackState().volume * 100)
  );

  public readonly isEffectivelySilent = computed(() =>
    isTrackSilent(this.trackState(), this.hasAnySolo())
  );

  constructor() {
    addIcons({ downloadOutline, musicalNoteOutline, pulseOutline, volumeHighOutline, 
      volumeMuteOutline });
  }

  onVolumeInput(event: Event): void {
    this.volumeChange.emit(readInputNumber(event));
  }
}