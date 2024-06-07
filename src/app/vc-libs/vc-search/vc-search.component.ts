import { Component, effect, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { NgClass } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDateRangePicker,
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import {
  END_OF_DAY_HOURS,
  END_OF_DAY_MILLISECONDS,
  END_OF_DAY_MINUTES,
  END_OF_DAY_SECONDS
} from '@constants/app.constants';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { KeyValue } from '@models/common.model';
import { UtilityService } from '@services/utility.service';
import { SearchField, SearchFieldType } from '@vc-libs/types';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSvgIconComponent } from '@vc-libs/vc-svg-icon/vc-svg-icon.component';

const modules = [
  FormsModule,
  ReactiveFormsModule,
  TranslateModule,
  NgSelectModule,
  MatDatepickerModule,
  MatNativeDateModule
];
const components = [VcInputComponent, VcButtonComponent, VcSvgIconComponent];

@Component({
  selector: 'app-vc-search',
  standalone: true,
  imports: [...modules, ...components, NgClass, SvgIconComponent],
  templateUrl: './vc-search.component.html'
})
export class VcSearchComponent {
  items = input.required<SearchField[]>();
  prefillValue = input<KeyValue>();

  search = output<Record<string, unknown>>();
  clear = output<Record<string, unknown>>();
  export = output<void>();

  searchParams = signal<Record<string, unknown>>({});
  previousSearchParams = signal<Record<string, unknown>>({});
  openFilter = signal(false);
  today = signal<Date>(new Date());
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  readonly fieldType = SearchFieldType;

  constructor(
    private translateService: TranslateService,
    private utilityService: UtilityService
  ) {
    effect(
      () => {
        this.prefillValue() &&
          (this.searchParams()[this.prefillValue().key as string] =
            this.prefillValue().value);
      },
      { allowSignalWrites: true }
    );
  }

  onSearch() {
    this.searchParams().searchText = (
      this.searchParams().searchText as string
    )?.trim();
    if (this.checkObjectAreSimilarOrNot()) return;
    this.previousSearchParams.set(structuredClone(this.searchParams()));
    this.search.emit(this.searchParams());
  }

  onClear() {
    if (this.checkObjectAreSimilarOrNot()) return;
    this.searchParams.set({});
    this.dateRange.reset();
    this.previousSearchParams.set({});
    this.search.emit(this.searchParams());
  }

  checkObjectAreSimilarOrNot() {
    return (
      this.utilityService.areObjectsSimilar(
        this.searchParams(),
        this.previousSearchParams()
      ) && this.utilityService.checkObjectIsEmpty(this.searchParams())
    );
  }

  onClearDate(picker: MatDatepicker<unknown>, key: string) {
    this.searchParams()[key] = null;
    picker.close();
  }

  onClearDateRange(picker: MatDateRangePicker<unknown>, key: string) {
    this.dateRange.reset();
    this.searchParams()[key] = null;
    picker.close();
  }

  onApplyDateRange(key: string) {
    if (this.dateRange.value.start && this.dateRange.value.end) {
      this.dateRange.value.end.setHours(
        END_OF_DAY_HOURS,
        END_OF_DAY_MINUTES,
        END_OF_DAY_SECONDS,
        END_OF_DAY_MILLISECONDS
      );
      this.searchParams()[key] = this.dateRange.value;
    } else {
      this.dateRange.reset();
      this.searchParams()[key] = null;
    }
  }

  translationExist(key: string) {
    return this.translateService.instant(key) !== key;
  }

  showFilter() {
    this.openFilter.update((value) => !value);
  }
}
