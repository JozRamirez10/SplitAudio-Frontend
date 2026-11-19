import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { syncOutline } from 'ionicons/icons';
import { filter, switchMap, timer } from 'rxjs';
import { ActiveJobsDtoResponse } from '../../models/dtos/orchestrator.model';
import { OrchestratorService } from '../../services/orchestrator.service';

@Component({
  selector: 'app-active-jobs-badge',
  templateUrl: './active-jobs-badge.component.html',
  styleUrls: ['./active-jobs-badge.component.scss'],
  imports: [
    IonIcon
  ],
})
export class ActiveJobsBadgeComponent {

  private readonly orchestratorService = inject(OrchestratorService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly activeJobs = signal<number>(0);

  constructor() {
    addIcons({ syncOutline });
    this.getActiveJobs();
  }

  private getActiveJobs() {
    timer(0, 15000).pipe(
      filter(() => document.visibilityState === 'visible'),
      switchMap(() => this.orchestratorService.getActiveJobs()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: ActiveJobsDtoResponse) => this.activeJobs.set(res.actives),
      error: (err) => console.error(0)
    });
  }
}
