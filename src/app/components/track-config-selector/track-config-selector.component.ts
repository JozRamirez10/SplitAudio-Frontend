import { Component, input, model } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';
import { APP } from '../../constants/constants';
import { TRACK_MODE_GROUPS, TRACK_TOGGLE_OPTIONS } from '../../constants/instruments.options';
import { SeparationMode } from '../../enums/separation.mode.enum';
import { OrchestratorRequest } from '../../models/dtos/orchestrator.model';
import { BooleanTrackKey, ModeTrackKey } from '../../models/internal/mode.option.model';

@Component({
  selector: 'app-track-config-selector',
  templateUrl: './track-config-selector.component.html',
  styleUrls: ['./track-config-selector.component.scss'],
  imports: [
    IonIcon
  ],
})
export class TrackConfigSelectorComponent {

  public readonly config = model.required<OrchestratorRequest>();
  public readonly disabled = input<boolean>(false);

  public readonly toggleOptions = TRACK_TOGGLE_OPTIONS;
  public readonly modeGroups = TRACK_MODE_GROUPS;

  constructor() {
    addIcons({ timeOutline });
  }

  onToggleTrack(key: BooleanTrackKey): void {
    this.updateField(key, !this.config()[key]);
  }

  onSelectMode<K extends ModeTrackKey>(key: K, value: OrchestratorRequest[K]): void {
    if (this.isOptionInMaintenance(key, value)) {
      return;
    }
    this.updateField(key, value);
  }

  isOptionInMaintenance(group: string, optionValue: any): boolean {
    return APP.GROUP_MAINTENANCE.includes(group) && optionValue === SeparationMode.INDIVIDUAL;
  }

  private updateField<K extends keyof OrchestratorRequest>(
    key: K,
    value: OrchestratorRequest[K]
  ): void {
    if (this.disabled()) {
      return;
    }

    this.config.update(current => ({ ...current, [key]: value }));
  }
}
