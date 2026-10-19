import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

interface CliCommand {
  key: string;
  label: string;
  cmd: string;
  text: string;
  tags: string[];
}

const COMMANDS: CliCommand[] = [
  {
    key: 'whoami',
    label: 'whoami',
    cmd: 'whoami',
    text: 'Full-stack developer who likes computer science and building real-world solutions. Thriving in collaborative teams, algorithmic challenges, and autonomous system architecture.',
    tags: ['Zone01 Oujda (Peer-to-Peer Engineering)', 'HPS Casablanca (Acquirer Team Intern)', 'Morocco (GMT+1)'],
  },
  {
    key: 'work',
    label: 'work',
    cmd: 'cat ~/projects.md | head -n 5',
    text: 'Pinned builds: Buy-01 (Java microservices + Angular), 0-shell (a Unix shell in Rust), 01Blog (Java), bomberman-dom (browser game), facebook-like (social network app).',
    tags: ['20 Repositories Total', 'Microservices', 'Rust Shell', 'Browser Game'],
  },
  {
    key: 'learn',
    label: 'learn',
    cmd: 'systemctl status curriculum.service',
    text: 'Self-driven learning: systems programming in Rust, microservices with Java Spring Boot, concurrent servers in Go, dynamic frontends in React and Angular, and containers with Docker.',
    tags: ['Always Learning', 'Algorithms', 'Unix & Networking'],
  },
  {
    key: 'server',
    label: 'server.yml',
    cmd: 'docker ps && cat /etc/nginx/nginx.conf',
    text: 'Ubuntu instance on Oracle Cloud (Morocco West), serving Nginx in Docker, with Security List rules and iptables set up by hand. DNS for rachidserraf.com is on Cloudflare.',
    tags: ['Domain: rachidserraf.com', 'Nginx in Docker', 'Oracle Cloud'],
  },
];

@Component({
  selector: 'app-terminal',
  imports: [],
  templateUrl: './terminal.html',
  styleUrl: './terminal.css',
})
export class Terminal implements OnInit {
  readonly commands = COMMANDS;
  readonly tabOn =
    'cmd-tab px-3 py-1 rounded cli-accent-bg text-noir-950 font-bold transition active-progress';
  readonly tabOff =
    'cmd-tab px-3 py-1 rounded bg-noir-800 hover:bg-noir-700 text-sand-200 border border-noir-700 transition';

  readonly active = signal(COMMANDS[0].key);
  readonly cmdDisplay = signal(COMMANDS[0].cmd);
  readonly textDisplay = signal(COMMANDS[0].text);
  readonly tags = signal<string[]>(COMMANDS[0].tags);

  private index = 0;
  private typeToken = 0;
  private typeTimer?: ReturnType<typeof setTimeout>;
  private cycleTimer?: ReturnType<typeof setInterval>;
  private readonly reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.typeTimer);
      clearInterval(this.cycleTimer);
    });
  }

  ngOnInit(): void {
    this.startAutoCycle();
  }

  select(key: string): void {
    const idx = COMMANDS.findIndex((c) => c.key === key);
    if (idx < 0) return;
    this.index = idx;
    this.display(idx, true);
    this.startAutoCycle();
  }

  private display(idx: number, animate: boolean): void {
    const command = COMMANDS[idx];
    const token = ++this.typeToken;
    clearTimeout(this.typeTimer);
    this.active.set(command.key);
    this.cmdDisplay.set(command.cmd);
    this.tags.set(command.tags);
    if (!animate || this.reduce) {
      this.textDisplay.set(command.text);
      return;
    }
    this.textDisplay.set('');
    let i = 0;
    const step = (): void => {
      if (token !== this.typeToken) return;
      this.textDisplay.set(command.text.slice(0, ++i));
      if (i < command.text.length) this.typeTimer = setTimeout(step, 14);
    };
    step();
  }

  private startAutoCycle(): void {
    clearInterval(this.cycleTimer);
    if (this.reduce) return;
    this.cycleTimer = setInterval(() => {
      this.index = (this.index + 1) % COMMANDS.length;
      this.display(this.index, true);
    }, 6000);
  }
}
