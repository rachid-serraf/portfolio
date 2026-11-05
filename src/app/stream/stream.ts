import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';

type TrackId = 'frontend' | 'backend' | 'devops';

interface Milestone {
  track: TrackId;
  date: string; // 'YYYY-MM'
  title: string;
  note: string;
}

interface TrackDef {
  id: TrackId;
  label: string;
  color: string; 
}

const START = '2024-04';

const MILESTONES: Milestone[] = [
  // Backend
  { track: 'backend', date: '2024-04', title: 'go-reloaded', note: 'First project at Zone01 Oujda: text tool in Go.' },
  { track: 'backend', date: '2024-05', title: 'ascii-art-web', note: 'First web server and HTML templates in Go.' },
  { track: 'backend', date: '2024-08', title: 'groupie-tracker', note: 'Consuming a REST API and showing the data.' },
  { track: 'backend', date: '2024-09', title: 'lem-in', note: 'Pathfinding algorithms in Go.' },
  { track: 'backend', date: '2024-12', title: 'forum', note: 'Full forum: auth, posts, sessions, SQLite.' },
  { track: 'backend', date: '2025-03', title: 'social-network', note: 'Full-stack social network.' },
  { track: 'backend', date: '2025-07', title: 'piscine-rust', note: 'A new language: Rust, ownership and safety.' },
  { track: 'backend', date: '2025-09', title: 'piscine-java', note: 'Java foundations.' },
  { track: 'backend', date: '2026-01', title: 'java-localserver', note: 'An HTTP server written from scratch in Java.' },
  { track: 'backend', date: '2026-03', title: 'buy-01', note: 'E-commerce platform with Spring Boot.' },
  { track: 'backend', date: '2026-08', title: 'HPS internship', note: 'Migrating PL/SQL stored procedures to Spring Boot microservices.' },
  { track: 'backend', date: '2026-10', title: 'buy-02', note: 'Buy-01 plus cart, orders, search and a CI pipeline.' },
  // Frontend
  { track: 'frontend', date: '2025-01', title: 'make-your-game', note: 'Browser game in plain JavaScript, 60 fps.' },
  { track: 'frontend', date: '2025-02', title: 'real-time-forum', note: 'WebSockets and a single-page app.' },
  { track: 'frontend', date: '2025-03', title: 'social-network', note: 'Full-stack social network.' },
  { track: 'frontend', date: '2025-04', title: 'mini-framework', note: 'Built my own JavaScript framework.' },
  { track: 'frontend', date: '2025-05', title: 'bomberman-dom', note: 'Multiplayer game on top of my own framework.' },
  { track: 'frontend', date: '2026-02', title: 'angul-it', note: 'First Angular project.' },
  { track: 'frontend', date: '2026-03', title: 'buy-01', note: 'E-commerce platform with Spring Boot.' },
  { track: 'frontend', date: '2026-10', title: 'buy-02', note: 'Buy-01 plus cart, orders, search and a CI pipeline.' },
  { track: 'frontend', date: '2026-11', title: 'Portfolio in Angular', note: 'Rebuilt this site as an Angular app.' },
  // DevOps
  { track: 'devops', date: '2024-07', title: 'dockerize', note: 'First containers.' },
  { track: 'devops', date: '2025-08', title: 'linux', note: 'Linux administration.' },
  { track: 'devops', date: '2025-10', title: 'add-vm', note: 'Set up and managed virtual machines.' },
  { track: 'devops', date: '2025-11', title: 'scan', note: 'Network scanning and security basics.' },
  { track: 'devops', date: '2026-8', title: 'Own server + HTTPS', note: 'Oracle Cloud, nginx, Docker, Cloudflare domain.' },
  { track: 'devops', date: '2026-9', title: 'Jenkins', note: 'CI/CD pipeline and code unit test.' },
  { track: 'devops', date: '2026-10', title: 'SonarQube', note: 'Add code quality checks to pipeline.' },
];

const LEARNING = ['Angular signals and SSR', 'Kafka event flows', 'CI/CD pipelines', 'Spring Boot microservices', 'Nginx and Cloudflare'];

const TRACKS: TrackDef[] = [
  { id: 'frontend', label: 'Frontend', color: 'text-cyber-sage' },
  { id: 'backend', label: 'Backend', color: 'text-cyber-orange' },
  { id: 'devops', label: 'DevOps', color: 'text-cyber-cyan' },
];

const W = 1000;
const H = 360;
const PAD_L = 24;
const PAD_R = 72;
const PAD_B = 40;

const monthIndex = (d: string): number => {
  const [y, m] = d.split('-').map(Number);
  return y * 12 + (m - 1);
};

interface Node {
  id: string;
  track: TrackId;
  color: string;
  trackLabel: string;
  date: string;
  title: string;
  note: string;
  x: number;
  y: number;
  order: number;
}

@Component({
  selector: 'app-stream',
  imports: [],
  templateUrl: './stream.html',
  styleUrl: './stream.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stream {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly W = W;
  readonly H = H;
  readonly legend = TRACKS;
  readonly shown = signal(false);
  readonly learningIdx = signal(0);
  readonly learning = computed(() => LEARNING[this.learningIdx()]);

  private readonly startIdx = monthIndex(START);
  private readonly nowIdx = (() => {
    const n = new Date();
    return n.getFullYear() * 12 + n.getMonth();
  })();
  private readonly span = Math.max(1, this.nowIdx - this.startIdx);

  readonly months = this.span;
  readonly count = MILESTONES.length;
  readonly validated = 85; 
  readonly baseY = H - PAD_B;
  readonly xNow = W - PAD_R;

  private readonly step = (H - PAD_B - 24) / Math.max(...TRACKS.map((t) => MILESTONES.filter((m) => m.track === t.id).length));

  private x(idx: number): number {
    return PAD_L + ((idx - this.startIdx) / this.span) * (W - PAD_L - PAD_R);
  }

  private y(level: number): number {
    return this.baseY - level * this.step;
  }

  readonly tracks = TRACKS.map((t) => {
    const ms = MILESTONES.filter((m) => m.track === t.id).sort((a, b) => monthIndex(a.date) - monthIndex(b.date));
    const nodes: Node[] = ms.map((m, i) => ({
      id: `${t.id}-${i}`,
      track: t.id,
      color: t.color,
      trackLabel: t.label,
      date: m.date,
      title: m.title,
      note: m.note,
      x: this.x(monthIndex(m.date)),
      y: this.y(i + 1),
      order: monthIndex(m.date),
    }));
    const pts = [{ x: this.x(this.startIdx), y: this.y(0) }, ...nodes, { x: this.xNow, y: nodes.length ? nodes[nodes.length - 1].y : this.y(0) }];
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const mx = (a.x + b.x) / 2;
      path += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
    }
    return { ...t, nodes, path, endY: pts[pts.length - 1].y };
  });

  readonly allNodes = this.tracks.flatMap((t) => t.nodes).sort((a, b) => a.order - b.order);

  readonly ticks = (() => {
    const out: { x: number; label: string }[] = [];
    const startYear = Math.floor(this.startIdx / 12);
    const nowYear = Math.floor(this.nowIdx / 12);
    for (let yr = startYear + 1; yr <= nowYear; yr++) out.push({ x: this.x(yr * 12), label: String(yr) });
    return out;
  })();

  readonly selected = signal<Node | null>(this.allNodes[this.allNodes.length - 1] ?? null);

  select(n: Node): void {
    this.selected.set(n);
  }

  constructor() {
    afterNextRender(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            this.shown.set(true);
            io.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      io.observe(this.host.nativeElement);

      let timer: ReturnType<typeof setInterval> | undefined;
      if (reduce) this.shown.set(true);
      else timer = setInterval(() => this.learningIdx.update((i) => (i + 1) % LEARNING.length), 2600);

      this.destroyRef.onDestroy(() => {
        io.disconnect();
        if (timer) clearInterval(timer);
      });
    });
  }
}