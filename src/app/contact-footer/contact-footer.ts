import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject } from '@angular/core';

const PARTICLE_COUNT = 140;

interface ContactTarget {
  bx: number;
  by: number;
  rx: number;
  ry: number;
}

interface ContactParticle {
  i: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
}

@Component({
  selector: 'app-contact-footer',
  imports: [],
  templateUrl: './contact-footer.html',
  styleUrl: './contact-footer.css',
})
export class ContactFooter implements AfterViewInit {
  @ViewChild('canvas', { static: true }) private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private mode: 'brackets' | 'ring' = 'brackets';

  onButtonEnter(): void {
    this.mode = 'ring';
  }

  onButtonLeave(): void {
    this.mode = 'brackets';
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const abort = new AbortController();
    let frame = 0;
    let width = (canvas.width = parent.clientWidth);
    let height = (canvas.height = parent.clientHeight);
    let targets: ContactTarget[] = [];
    const particles: ContactParticle[] = [];

    const build = (): void => {
      targets = [];
      const cx = width * 0.82;
      const cy = height * 0.5;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let bx: number;
        let by: number;
        if (i < PARTICLE_COUNT / 2) {
          const t = i / (PARTICLE_COUNT / 2);
          bx = cx - 45 + (t < 0.2 || t > 0.8 ? 20 : 0);
          by = cy - 50 + t * 100;
        } else {
          const t = (i - PARTICLE_COUNT / 2) / (PARTICLE_COUNT / 2);
          bx = cx + 45 - (t < 0.2 || t > 0.8 ? 20 : 0);
          by = cy - 50 + t * 100;
        }
        const a = (i / PARTICLE_COUNT) * 6.2832;
        targets.push({ bx, by, rx: cx + Math.cos(a) * 55, ry: cy + Math.sin(a) * 55 });
      }
    };

    build();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        s: Math.random() * 2 + 1.2,
      });
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const orangeRgb = rootStyle.getPropertyValue('--color-cyber-orange-rgb').trim();
    const ringParticle = rootStyle.getPropertyValue('--color-ring-particle').trim();

    const render = (): void => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = this.mode === 'brackets' ? `rgba(${orangeRgb},.7)` : ringParticle;
      particles.forEach((p) => {
        const t = targets[p.i];
        const dx = (this.mode === 'brackets' ? t.bx : t.rx) - p.x;
        const dy = (this.mode === 'brackets' ? t.by : t.ry) - p.y;
        p.vx = (p.vx + dx * 0.04) * 0.78;
        p.vy = (p.vy + dy * 0.04) * 0.78;
        p.x += p.vx;
        p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, 6.2832);
        ctx.fill();
      });
      if (!reduce) frame = requestAnimationFrame(render);
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener(
        'resize',
        () => {
          width = canvas.width = parent.clientWidth;
          height = canvas.height = parent.clientHeight;
          build();
        },
        { signal: abort.signal },
      );
      render();
    });

    this.destroyRef.onDestroy(() => {
      abort.abort();
      cancelAnimationFrame(frame);
    });
  }
}
