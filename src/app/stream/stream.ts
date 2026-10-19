import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject } from '@angular/core';

type WaveLine = [rgb: string, speed: number, amplitude: number, frequency: number, phase: number, yOffset: number];

const LINES: WaveLine[] = [
  ['234,160,66', 0.95, 46, 0.0048, 0, -12],
  ['94,139,113', 1.25, 52, 0.0054, 0.75, -6],
  ['255,107,107', 1.1, 40, 0.0062, 1.45, 4],
  ['200,194,186', 1.35, 58, 0.0051, 2.15, -8],
  ['234,160,66', 1.45, 62, 0.0068, 2.9, 0],
  ['94,139,113', 1.15, 48, 0.0058, 3.65, 8],
  ['255,107,107', 1.05, 44, 0.0064, 4.4, -4],
  ['200,194,186', 0.85, 38, 0.0042, 5.15, 6],
  ['234,160,66', 1.2, 50, 0.0046, 5.9, -2],
];

const DUST = ['#EAA042', '#5E8B71', '#FF6B6B', '#C8C2BA', '#EAA042', '#5E8B71'];

@Component({
  selector: 'app-stream',
  imports: [],
  templateUrl: './stream.html',
  styleUrl: './stream.css',
})
export class Stream implements AfterViewInit {
  @ViewChild('canvas', { static: true }) private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    const box = canvas?.parentElement;
    if (!canvas || !ctx || !box) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const abort = new AbortController();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let sc = 1;
    let t = 0;
    let visible = true;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const m = { x: 0, y: 0, tx: 0, ty: 0, on: false, s: 0 };

    const resize = (): void => {
      const r = box.getBoundingClientRect();
      w = r.width;
      h = r.height;
      sc = Math.min(1, h / 380);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      m.x = m.tx = w / 2;
      m.y = m.ty = h / 2;
    };

    const draw = (): void => {
      if (visible) {
        t += 0.02;
        m.x += (m.tx - m.x) * 0.08;
        m.y += (m.ty - m.y) * 0.08;
        m.s += ((m.on ? 1 : 0) - m.s) * 0.06;
        ctx.clearRect(0, 0, w, h);
        LINES.forEach(([rgb, speed, amp, fr, ph, yo]) => {
          const cy = h / 2 + yo * sc;
          ctx.beginPath();
          ctx.moveTo(0, cy);
          for (let x = 0; x <= w; x += 6) {
            let y = Math.sin(x * fr + t * speed + ph) * amp * sc;
            y += Math.cos(x * fr * 2.1 - t * 0.75 + ph * 0.5) * amp * sc * 0.32;
            y += Math.sin(x * 0.015 + t * 1.5) * 4 * sc;
            const d = Math.hypot(x - m.x, cy + y - m.y);
            if (d < 220) y -= Math.sin(d * 0.028) * (220 - d) * 0.28 * m.s;
            ctx.lineTo(x, cy + y);
          }
          ctx.strokeStyle = `rgba(${rgb},.88)`;
          ctx.lineWidth = 0.9;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${rgb},.5)`;
          ctx.globalAlpha = 1;
          ctx.stroke();
        });
        for (let i = 0; i < 32; i++) {
          const px = (i * 107 + t * 55) % w;
          const py = h / 2 + Math.sin(px * 0.0055 + t * 0.9 + i) * 58 * sc;
          ctx.beginPath();
          ctx.arc(px, py, (i % 3) * 0.5 + 0.9, 0, 6.2832);
          ctx.fillStyle = DUST[i % 6];
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.fillStyle;
          ctx.globalAlpha = 0.65;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      if (!reduce) frame = requestAnimationFrame(draw);
    };

    this.zone.runOutsideAngular(() => {
      resize();
      window.addEventListener('resize', resize, { signal: abort.signal });
      box.addEventListener(
        'mousemove',
        (e: MouseEvent) => {
          const r = canvas.getBoundingClientRect();
          m.tx = e.clientX - r.left;
          m.ty = e.clientY - r.top;
          m.on = true;
        },
        { signal: abort.signal },
      );
      box.addEventListener('mouseleave', () => (m.on = false), { signal: abort.signal });
      observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      });
      observer.observe(box);
      draw();
    });

    this.destroyRef.onDestroy(() => {
      abort.abort();
      observer?.disconnect();
      cancelAnimationFrame(frame);
    });
  }
}
