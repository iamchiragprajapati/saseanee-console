import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Params } from '@angular/router';
import { VcLoaderComponent } from 'app/vc-libs/vc-loader/vc-loader.component';

@Component({
  selector: 'app-vc-button',
  standalone: true,
  imports: [NgClass, VcLoaderComponent],
  templateUrl: './vc-button.component.html'
})
export class VcButtonComponent {
  type = input<'button' | 'submit'>('button');
  class = input<Params>();
  isDisabled = input(false);
  tooltip = input('');
  spin = input(false);

  buttonTap = output<Event>();

  click(e: Event) {
    this.buttonTap.emit(e);
  }
}
