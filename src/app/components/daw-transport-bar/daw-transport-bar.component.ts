import { Component, computed, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { pause, play, playBackOutline, playForwardOutline, playSkipBackOutline } from 'ionicons/icons';
import { formatTime, readInputNumber } from '../../utils/daw.utils';

@Component({
  selector: 'app-daw-transport-bar',
  templateUrl: './daw-transport-bar.component.html',
  styleUrls: ['./daw-transport-bar.component.scss'],
  imports: [IonIcon],
})
export class DawTransportBarComponent {

  public readonly isPlaying = input<boolean>(false);
  public readonly currentTime = input<number>(0);
  public readonly duration = input<number>(0);
  public readonly disabled = input<boolean>(false);

  public readonly togglePlay = output<void>();
  public readonly seek = output<number>();
  public readonly skip = output<number>();
  public readonly restart = output<void>();

  private readonly isSeeking = signal<boolean>(false);
  private readonly seekPreviewTime = signal<number>(0);

  public readonly displayedTime = computed(() =>
    this.isSeeking() ? this.seekPreviewTime() : this.currentTime()
  );

  public readonly progressPercent = computed(() => {
    const total = this.duration();
    return total > 0 ? (this.displayedTime() / total) * 100 : 0;
  });

  public readonly formattedCurrentTime = computed(() => formatTime(this.displayedTime()));
  public readonly formattedDuration = computed(() => formatTime(this.duration()));

  constructor() {
    addIcons({ play, pause, playBackOutline, playForwardOutline, playSkipBackOutline });
  }

  onSeekInput(event: Event): void {
    this.isSeeking.set(true);
    this.seekPreviewTime.set(readInputNumber(event));
  }

  onSeekCommit(event: Event): void {
    this.isSeeking.set(false);
    this.seek.emit(readInputNumber(event));
  }

  onSeekCancel(): void {
    this.isSeeking.set(false);
  }
}