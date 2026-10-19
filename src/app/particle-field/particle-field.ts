import { AfterViewInit, Component, DestroyRef, ElementRef, NgZone, ViewChild, inject } from '@angular/core';

interface MousePoint {
  x: number;
  y: number;
  radius: number;
}

class MeshParticle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  size = 1;
  color = '';

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.size = Math.random() * 2 + 1;
    this.color = Math.random() > 0.4 ? 'rgba(255,122,48,.6)' : 'rgba(224,161,94,.4)';
  }

  update(mouse: MousePoint, width: number, height: number): void {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < mouse.radius) {
      const f = (mouse.radius - d) / mouse.radius;
      const a = Math.atan2(dy, dx);
      this.x -= Math.cos(a) * f * 5;
      this.y -= Math.sin(a) * f * 5;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 6.2832);
    ctx.fill();
  }
}

@Component({
  selector: 'app-particle-field',
  imports: [],
  templateUrl: './particle-field.html',
  styleUrl: './particle-field.css',
  host: {
    class: 'fixed inset-0 block pointer-events-none z-0 opacity-40',
    'aria-hidden': 'true',
  },
})
export class ParticleField implements AfterViewInit {
  @ViewChild('canvas', { static: true }) private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const abort = new AbortController();
    let frame = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const mouse: MousePoint = { x: -1000, y: -1000, radius: 120 };
    let particles: MeshParticle[] = [];

    const build = (): void => {
      particles = [];
      const n = Math.min(Math.floor((width * height) / 12000), 100);
      for (let i = 0; i < n; i++) particles.push(new MeshParticle(width, height));
    };

    const render = (): void => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.strokeStyle = `rgba(255,122,48,${0.15 * (1 - d / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        p.update(mouse, width, height);
        p.draw(ctx);
      });
      if (!reduce) frame = requestAnimationFrame(render);
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener(
        'resize',
        () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
          build();
        },
        { signal: abort.signal },
      );
      window.addEventListener(
        'mousemove',
        (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        },
        { signal: abort.signal },
      );
      document.addEventListener(
        'mouseleave',
        () => {
          mouse.x = -1000;
          mouse.y = -1000;
        },
        { signal: abort.signal },
      );
      build();
      render();
    });

    this.destroyRef.onDestroy(() => {
      abort.abort();
      cancelAnimationFrame(frame);
    });
  }
}
