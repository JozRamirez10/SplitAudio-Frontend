import { Component, computed, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, documentAttachOutline, musicalNoteOutline, trashOutline } from 'ionicons/icons';
import { APP } from '../../constants/constants';

@Component({
  selector: 'app-file-dropzone',
  templateUrl: './file-dropzone.component.html',
  styleUrls: ['./file-dropzone.component.scss'],
  imports: [
    IonIcon
  ],
})
export class FileDropzoneComponent {

  public readonly selectedFile = input<File | null>(null);
  public readonly disabled = input<boolean>(false);

  public readonly fileSelected = output<File>();
  public readonly fileRemoved = output<void>();

  public readonly isDragging = signal<boolean>(false);
  public readonly validationError = signal<string | null>(null);

  public readonly formattedSize = computed(() => {
    const file = this.selectedFile();
    return file ? `${this.getFileSizeMb(file).toFixed(2)} MB` : '';
  });

  constructor() {
    addIcons({
      cloudUploadOutline, documentAttachOutline, musicalNoteOutline, trashOutline
    });
  }

  onDragState(event: DragEvent, dragging: boolean): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.isDragging.set(dragging);
    }
  }

  onDrop(event: DragEvent): void {
    this.onDragState(event, false);
    if (this.disabled()) {
      return;
    }

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.validateAndEmit(file);
    }
  }

  onFileInputChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (file) {
      this.validateAndEmit(file);
    }
    inputEl.value = '';
  }

  onRemoveFile(event: Event): void {
    event.stopPropagation();
    this.validationError.set(null);
    this.fileRemoved.emit();
  }

  private validateAndEmit(file: File): void {
    this.validationError.set(null);

    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    if (!APP.ALLOWED_EXTENSIONS.includes(ext)) {
      this.validationError.set(
        `Formato no soportado (${ext}). Usa ${APP.ALLOWED_EXTENSIONS.join(', ')}`
      );
      return;
    }

    const sizeMb = this.getFileSizeMb(file);
    if (sizeMb > APP.MAX_FILE_SIZE_MB) {
      this.validationError.set(
        `El archivo pesa ${sizeMb.toFixed(1)} MB y excede el límite de ${APP.MAX_FILE_SIZE_MB} MB`
      );
      return;
    }

    this.fileSelected.emit(file);
  }

  private getFileSizeMb(file: File): number {
    return file.size / (1024 * 1024);
  }
}
