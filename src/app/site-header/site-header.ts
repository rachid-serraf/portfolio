import { Component, DestroyRef, EventEmitter, Output, inject, signal } from '@angular/core';
import { WorkbenchTab } from '../workbench/workbench';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

@Component({
  selector: 'app-site-header',
  imports: [],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  @Output() readonly tabJump = new EventEmitter<WorkbenchTab>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly media = window.matchMedia('(prefers-color-scheme: light)');

  readonly theme = signal<Theme>(document.documentElement.classList.contains('light') ? 'light' : 'dark');

  constructor() {
    const onSystemChange = (): void => {
      if (this.readStoredTheme()) return;
      this.apply(this.media.matches ? 'light' : 'dark');
    };
    this.media.addEventListener('change', onSystemChange);
    this.destroyRef.onDestroy(() => this.media.removeEventListener('change', onSystemChange));
  }

  toggleTheme(): void {
    this.apply(this.theme() === 'light' ? 'dark' : 'light', true);
  }

  private apply(theme: Theme, persist = false): void {
    this.theme.set(theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        /* storage unavailable */
      }
    }
  }

  private readStoredTheme(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (e) {
      return null;
    }
  }
}
