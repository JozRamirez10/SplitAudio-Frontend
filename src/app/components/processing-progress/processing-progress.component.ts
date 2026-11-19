import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, Input, OnDestroy, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotesOutline, timeOutline } from 'ionicons/icons';
import { MESSAGE_LOADING } from '../../constants/constants';
import { JobStatus } from '../../enums/job.status.enum';
import { SongState } from '../../states/song.state';

@Component({
  selector: 'app-processing-progress',
  templateUrl: './processing-progress.component.html',
  styleUrls: ['./processing-progress.component.scss'],
  imports: [
    IonIcon, DecimalPipe
  ],
})
export class ProcessingProgressComponent implements OnDestroy {

  @Input({ required: true }) estimatedTotalTime!: number;

  public readonly songState = inject(SongState);

  public readonly progress = signal<number>(0);
  public readonly progressMessage = signal<string>(MESSAGE_LOADING.PHASE1);
  private progressInterval: any;

  constructor() {
    addIcons({ timeOutline, musicalNotesOutline });

    effect(() => {
      const status = this.songState.currentJobStatus();

      if (status?.status === JobStatus.PROCESSING && !this.progressInterval) {
        this.startSimulationProgress();
      } 
    }, { allowSignalWrites: true });
  }
  
  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  private startSimulationProgress(): void {
    this.progress.set(0);

    const totalSeconds = this.estimatedTotalTime * 60;
    let currentSeconds = 0;

    this.progressInterval = setInterval(() => {
      currentSeconds++;

      const percent = Math.min(95, (currentSeconds / totalSeconds) * 100);
      this.progress.set(percent);

      if (percent < 15) this.progressMessage.set(MESSAGE_LOADING.PHASE2);
      else if (percent < 30) this.progressMessage.set(MESSAGE_LOADING.PHASE3);
      else if (percent < 70) this.progressMessage.set(MESSAGE_LOADING.PHASE4);
      else if (percent < 85) this.progressMessage.set(MESSAGE_LOADING.PHASE5);
      else this.progressMessage.set(MESSAGE_LOADING.PHASE6)

    }, 1000);
  }

}
