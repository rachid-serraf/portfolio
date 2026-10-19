import { Component } from '@angular/core';
import { Terminal } from '../terminal/terminal';

@Component({
  selector: 'app-hero',
  imports: [Terminal],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {}
