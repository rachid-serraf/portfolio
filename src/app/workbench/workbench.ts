import { Component, signal } from '@angular/core';

export type WorkbenchTab = 'projects' | 'stack' | 'server';

@Component({
  selector: 'app-workbench',
  imports: [],
  templateUrl: './workbench.html',
  styleUrl: './workbench.css',
})
export class Workbench {
  readonly tabOn = 'px-4 py-2 rounded-xl bg-cyber-orange text-noir-950 font-bold transition';
  readonly tabOff =
    'px-4 py-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition';

  readonly active = signal<WorkbenchTab>('projects');

  setTab(tab: WorkbenchTab): void {
    this.active.set(tab);
  }
}
