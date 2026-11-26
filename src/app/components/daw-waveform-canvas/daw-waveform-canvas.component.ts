import { Component, effect, ElementRef, input, viewChild } from '@angular/core';
import { WAVEFORM_STYLE } from '../../constants/daw.constants';

@Component({
  selector: 'app-daw-waveform-canvas',
  templateUrl: './daw-waveform-canvas.component.html',
  styleUrls: ['./daw-waveform-canvas.component.scss'],
})
export class DawWaveformCanvasComponent {

  public readonly peaks = input.required<number[]>();
  public readonly color = input<string>(WAVEFORM_STYLE.DEFAULT_COLOR);
  public readonly isSilent = input<boolean>(false);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('waveformCanvas');

  constructor() {
    effect((onCleanup) => {
      const canvas = this.canvasRef()?.nativeElement;
      if (!canvas) return;

      const observer = new ResizeObserver(() => this.drawWaveform());
      observer.observe(canvas);
      onCleanup(() => observer.disconnect());
    });

    effect(() => {
      this.peaks();
      this.color();
      this.isSilent();
      this.drawWaveform();
    });
  }

  private drawWaveform(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const midY = height / 2;
    ctx.fillStyle = WAVEFORM_STYLE.CENTER_LINE_COLOR;
    ctx.fillRect(0, midY - 0.5, width, 1);

    const peaks = this.peaks();
    if (peaks.length === 0) return;

    const barCount = Math.max(1, Math.floor(width / WAVEFORM_STYLE.STEP_PX));
    const maxBarHalfHeight = (height - WAVEFORM_STYLE.VERTICAL_PADDING_PX) / 2;

    ctx.fillStyle = this.isSilent() ? WAVEFORM_STYLE.SILENT_COLOR : this.color();

    for (let i = 0; i < barCount; i++) {
      const startIdx = Math.floor((i / barCount) * peaks.length);
      const endIdx = Math.max(startIdx + 1, Math.floor(((i + 1) / barCount) * peaks.length));

      let amplitude = 0;
      for (let j = startIdx; j < endIdx && j < peaks.length; j++) {
        if (peaks[j] > amplitude) amplitude = peaks[j];
      }

      const halfH = Math.max(WAVEFORM_STYLE.MIN_BAR_HALF_HEIGHT_PX, amplitude * maxBarHalfHeight);
      const x = i * WAVEFORM_STYLE.STEP_PX;
      ctx.fillRect(x, midY - halfH, WAVEFORM_STYLE.BAR_WIDTH_PX, halfH * 2);
    }
  }
}