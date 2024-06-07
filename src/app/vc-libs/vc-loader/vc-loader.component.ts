import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-vc-loader',
  standalone: true,
  imports: [NgClass],
  templateUrl: './vc-loader.component.html'
})
export class VcLoaderComponent {
  class = input<Record<string, boolean>>();
}
