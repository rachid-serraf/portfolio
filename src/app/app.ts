import { Component, ViewChild } from '@angular/core';
import { ContactFooter } from './contact-footer/contact-footer';
import { Experience } from './experience/experience';
import { Hero } from './hero/hero';
import { ParticleField } from './particle-field/particle-field';
import { SiteHeader } from './site-header/site-header';
import { StatusBar } from './status-bar/status-bar';
import { Stream } from './stream/stream';
import { Workbench, WorkbenchTab } from './workbench/workbench';

@Component({
  selector: 'app-root',
  imports: [ParticleField, StatusBar, SiteHeader, Hero, Stream, Workbench, Experience, ContactFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild(Workbench) private workbench?: Workbench;

  jumpToTab(tab: WorkbenchTab): void {
    this.workbench?.setTab(tab);
  }
}
