import { Component, EventEmitter, Output } from '@angular/core';
import { WorkbenchTab } from '../workbench/workbench';

@Component({
  selector: 'app-site-header',
  imports: [],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  @Output() readonly tabJump = new EventEmitter<WorkbenchTab>();
}
