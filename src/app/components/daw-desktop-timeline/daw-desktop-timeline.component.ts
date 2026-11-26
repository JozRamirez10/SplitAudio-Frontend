import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { downloadOutline, musicalNoteOutline, pulseOutline, volumeHighOutline, volumeMuteOutline } from 'ionicons/icons';
import { DAW_UI } from '../../constants/daw.constants';
import { getTrackColorTheme } from '../../constants/track.colors';
import { SongTrack } from '../../models/dtos/song.track.model';
import { DawTrackState } from '../../models/internal/daw.track.model';
import { clamp, formatTime, getRulerStepSeconds, getTrackIcon, getTrackLabel, isTrackSilent, readInputNumber } from '../../utils/daw.utils';
import { DawWaveformCanvasComponent } from '../daw-waveform-canvas/daw-waveform-canvas.component';

interface RulerTick {
  label: string;
  percent: number;
}

@Component({
  selector: 'app-daw-desktop-timeline',
  templateUrl: './daw-desktop-timeline.component.html',
  styleUrls: ['./daw-desktop-timeline.component.scss'],
  imports: [IonIcon, DawWaveformCanvasComponent],
})
export class DawDesktopTimelineComponent {

  public readonly tracks = input.required<DawTrackState[]>();
  public readonly hasAnySolo = input<boolean>(false);
  public readonly currentTime = input<number>(0);
  public readonly duration = input<number>(0);

  public readonly volumeChange = output<{ trackId: string; volume: number }>();
  public readonly toggleMute = output<string>();
  public readonly toggleSolo = output<string>();
  public readonly downloadTrack = output<SongTrack>();
  public readonly seek = output<number>();

  protected readonly getTrackLabel = getTrackLabel;
  protected readonly getTrackTheme = getTrackColorTheme;
  protected readonly getTrackIcon = getTrackIcon;

  private readonly timelineAreaRef = viewChild<ElementRef<HTMLDivElement>>('timelineArea');

  public readonly isScrubbing = signal<boolean>(false);
  private readonly scrubTime = signal<number>(0);
  public readonly hoverPercent = signal<number | null>(null);

  public readonly activeTime = computed(() =>
    this.isScrubbing() ? this.scrubTime() : this.currentTime()
  );

  public readonly playheadPercent = computed(() => {
    const total = this.duration();
    return total > 0 ? clamp((this.activeTime() / total) * 100, 0, 100) : 0;
  });

  public readonly formattedActiveTime = computed(() => formatTime(this.activeTime()));

  public readonly rulerTicks = computed<RulerTick[]>(() => {
    const total = this.duration();
    if (total <= 0) return [];

    const step = getRulerStepSeconds(total);
    const ticks: RulerTick[] = [];

    for (let sec = 0; sec <= total; sec += step) {
      const percent = (sec / total) * 100;
      if (percent <= DAW_UI.RULER_MAX_VISIBLE_PERCENT) {
        ticks.push({ label: formatTime(sec), percent });
      }
    }
    return ticks;
  });

  constructor() {
    addIcons({ downloadOutline, musicalNoteOutline, pulseOutline, volumeHighOutline, 
      volumeMuteOutline });
  }

  isTrackSilent(item: DawTrackState): boolean {
    return isTrackSilent(item, this.hasAnySolo());
  }

  onVolumeInput(trackId: string, event: Event): void {
    this.volumeChange.emit({ trackId, volume: readInputNumber(event) });
  }

  onTimelinePointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.duration() <= 0) return;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.isScrubbing.set(true);
    this.scrubTime.set(this.calculateTimeFromPointer(event.clientX));
  }

  onTimelinePointerMove(event: PointerEvent): void {
    const percent = this.calculatePercentFromPointer(event.clientX);
    this.hoverPercent.set(percent);

    if (this.isScrubbing()) {
      this.scrubTime.set((percent / 100) * this.duration());
    }
  }

  onTimelinePointerUp(event: PointerEvent): void {
    if (!this.isScrubbing()) return;

    const el = event.currentTarget as HTMLElement;
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    const targetTime = this.calculateTimeFromPointer(event.clientX);
    this.isScrubbing.set(false);
    this.seek.emit(targetTime);
  }

  onTimelinePointerCancel(): void {
    this.isScrubbing.set(false);
  }

  onTimelinePointerLeave(): void {
    if (!this.isScrubbing()) {
      this.hoverPercent.set(null);
    }
  }

  private calculatePercentFromPointer(clientX: number): number {
    const area = this.timelineAreaRef()?.nativeElement;
    if (!area) return 0;

    const rect = area.getBoundingClientRect();
    if (rect.width <= 0) return 0;

    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }

  private calculateTimeFromPointer(clientX: number): number {
    return (this.calculatePercentFromPointer(clientX) / 100) * this.duration();
  }
}