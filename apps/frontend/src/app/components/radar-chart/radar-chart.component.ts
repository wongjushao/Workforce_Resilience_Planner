import {
  Component, Input, OnChanges, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillAxis } from '../../mock-data/mock-data';

export interface RadarSeries {
  label: string;
  scores: Record<string, number>;
  color: string;   // hex
  fillAlpha?: number;
}

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="radar-wrap">
      <canvas #canvas [width]="size" [height]="size"></canvas>
      <div class="legend">
        @for (s of series; track s.label) {
          <span class="leg-item">
            <span class="leg-dot" [style.background]="s.color"></span>
            {{ s.label }}
          </span>
        }
      </div>
    </div>
  `,
  styles: [`
    .radar-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    canvas { display: block; }
    .legend { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
    .leg-item { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #94a3b8; }
    .leg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  `],
})
export class RadarChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() axes: SkillAxis[] = [];
  @Input() series: RadarSeries[] = [];
  @Input() size = 320;
  @Input() maxValue = 5;

  ngAfterViewInit(): void { this.draw(); }
  ngOnChanges(): void { if (this.canvasRef) this.draw(); }

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { size, axes, series, maxValue } = this;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;
    const n = axes.length;
    if (n < 3) return;

    ctx.clearRect(0, 0, size, size);

    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    const pt = (i: number, r: number) => ({
      x: cx + r * Math.cos(startAngle + i * angleStep),
      y: cy + r * Math.sin(startAngle + i * angleStep),
    });

    // ── Grid rings ──────────────────────────────────────────────────────────
    const levels = 5;
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius * lvl) / levels;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const { x, y } = pt(i, r);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(148,163,184,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // level label at top
      if (lvl < levels) {
        const labelR = r;
        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.font = `${size * 0.028}px 'IBM Plex Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${lvl}`, cx, cy - labelR + 4);
      }
    }

    // ── Spokes ───────────────────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const { x, y } = pt(i, radius);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Axis labels ──────────────────────────────────────────────────────────
    const fontSize = Math.max(10, size * 0.034);
    ctx.font = `600 ${fontSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < n; i++) {
      const labelR = radius + size * 0.085;
      const { x, y } = pt(i, labelR);
      const angle = startAngle + i * angleStep;
      ctx.textAlign =
        Math.abs(Math.cos(angle)) < 0.1 ? 'center'
        : Math.cos(angle) > 0 ? 'left' : 'right';
      ctx.textBaseline = Math.sin(angle) > 0.1 ? 'top' : Math.sin(angle) < -0.1 ? 'bottom' : 'middle';
      ctx.fillText(axes[i].label, x, y);
    }

    // ── Data polygons ─────────────────────────────────────────────────────────
    for (const s of series) {
      const hex = s.color;
      const alpha = s.fillAlpha ?? 0.18;

      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const val = Math.min(s.scores[axes[i].key] ?? 0, maxValue);
        const r = (val / maxValue) * radius;
        const { x, y } = pt(i, r);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // fill
      ctx.fillStyle = hexToRgba(hex, alpha);
      ctx.fill();

      // stroke
      ctx.strokeStyle = hex;
      ctx.lineWidth = 2;
      ctx.stroke();

      // dots
      for (let i = 0; i < n; i++) {
        const val = Math.min(s.scores[axes[i].key] ?? 0, maxValue);
        const r = (val / maxValue) * radius;
        const { x, y } = pt(i, r);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.fill();
      }
    }
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
