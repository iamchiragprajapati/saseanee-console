import { NgClass } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Params } from '@angular/router';

import { POSITION, REGEX_TYPE } from '@constants/app.enums';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';

@Component({
  selector: 'app-vc-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VcInputComponent),
      multi: true
    }
  ],
  templateUrl: './vc-input.component.html',
  styleUrls: ['./vc-input.component.scss'],
  standalone: true,
  imports: [NgClass, FormsModule, AllowNumberOnlyDirective]
})
export class VcInputComponent implements ControlValueAccessor {
  #controlValue = '';
  #propagateChange: (_param: unknown) => void = () => { };
  #propagateTouched: (_param: unknown) => void = () => { };

  customClass = input<Params>();
  label = input<string>();
  type = input<'text' | 'email' | 'password'>('text');
  name = input.required<string>();
  placeholder = input('');
  required = input(false);
  isDisabled = input(false);
  readOnly = input(false);
  applyAllowNumberOnly = input(false);
  pattern = input<RegExp>();
  regexType = input<REGEX_TYPE>();
  position = input<POSITION>(POSITION.LEFT);
  maxLength = input<number>(undefined);

  get control(): string {
    return this.#controlValue;
  }
  set control(value: string) {
    this.#controlValue = typeof value === 'string' ? value.trim() : value;
    this.#propagateChange(this.#controlValue);
  }

  writeValue(value: string) {
    this.control = value ?? '';
  }

  registerOnChange(fn: () => void) {
    this.#propagateChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.#propagateTouched = fn;
  }

  touched($event) {
    this.#propagateTouched($event);
  }
}
