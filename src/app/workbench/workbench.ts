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
    'px-4 py-2 rounded-xl text-sand-300 hover:text-sand-50 hover:bg-noir-800 transition';

  readonly active = signal<WorkbenchTab>('projects');

  setTab(tab: WorkbenchTab): void {
    this.active.set(tab);
  }
}
