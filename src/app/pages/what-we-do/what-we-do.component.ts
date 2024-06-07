import { DatePipe, NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { DateRange } from '@angular/material/datepicker';
import {
  APP,
  SORT_OPTIONS,
  STATUS,
  YES_NO_OPTIONS
} from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ActionToolbar, KeyValue, TableColumn } from '@models/common.model';
import { WhatWeDo } from '@models/whatWeDo.model';
import { DialogService } from '@services/dialog.service';
import { ToasterService } from '@services/toaster.service';
import { WhatWeDoService } from '@services/what-we-do.service';
import { SearchField, SearchFieldType } from '@vc-libs/types';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSearchComponent } from '@vc-libs/vc-search/vc-search.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [
  VcButtonComponent,
  VcInputComponent,
  VcActionToolbarComponent,
  VcTableComponent,
  SvgIconComponent,
  VcSearchComponent
];

@Component({
  selector: 'app-what-we-do',
  standalone: true,
  imports: [NgClass, RouterLink, DatePipe, ...modules, ...components],
  templateUrl: './what-we-do.component.html'
})
export class WhatWeDoComponent {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);

  whatWeDoList = new MatTableDataSource<WhatWeDo>();
  totalData = signal(0);
  columns = signal<TableColumn[]>([
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'title',
      label: 'common.title',
      sortable: true
    },
    {
      key: 'index',
      label: 'common.displayOrder',
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'common.date',
      sortable: true
    },
    {
      key: 'isActive',
      label: 'common.status',
      sortable: true
    },
    {
      key: 'isHighlighted',
      label: 'common.highlighted',
      sortable: true
    }
  ]);
  sortColumns = computed(() => this.columns().filter((c) => c.sortable));
  sortKey = signal(new FormControl<string>(undefined));
  sortValue = signal(new FormControl('desc'));
  searchFields = signal<SearchField[]>([
    {
      key: 'searchText',
      label: 'common.name',
      type: SearchFieldType.Text
    },
    {
      key: 'isActive',
      label: 'common.status',
      type: SearchFieldType.List,
      list: STATUS
    },
    {
      key: 'isHighlighted',
      label: 'common.highlighted',
      type: SearchFieldType.List,
      list: YES_NO_OPTIONS
    },
    {
      key: 'dateRange',
      label: 'common.date',
      type: SearchFieldType.DateRange
    }
  ]);
  searchValue = signal<KeyValue>(undefined);
  isLoading = signal(false);

  readonly sortOptions = SORT_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    private whatWeDoService: WhatWeDoService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.getWhatWeDoList();
  }

  buildListingQueryParams() {
    const dateRange = this.searchValue()?.dateRange as DateRange<Date>;
    const startDate = dateRange?.start ? dateRange.start.toISOString() : null;
    const endDate = dateRange?.end ? dateRange.end.toISOString() : null;
    return {
      sortOrder: this.sortValue().value,
      limit: this.vcTable?.paginator?.pageSize || APP.PAGE_SIZE,
      page: this.vcTable?.paginator?.pageIndex + 1 || APP.PAGE_INDEX,
      isDeleted: false,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(this.searchValue()?.searchText && {
        search: this.searchValue().searchText as string
      }),
      ...(typeof this.searchValue()?.isHighlighted === 'boolean' && {
        isHighlighted: this.searchValue().isHighlighted
      }),
      ...(typeof this.searchValue()?.isActive === 'boolean' && {
        isActive: this.searchValue().isActive
      }),
      ...(this.sortKey().value && { sortBy: this.sortKey().value })
    };
  }

  getPermissionActions(): ActionToolbar[] {
    return [
      {
        label: 'common.edit',
        callback: this.editWhatWeDo.bind(this)
      },
      {
        label: 'common.delete',
        callback: this.deleteWhatWeDo.bind(this)
      }
    ];
  }

  getWhatWeDoList(): void {
    this.isLoading.set(true);
    this.whatWeDoList = new MatTableDataSource([]);
    this.whatWeDoService
      .get(this.buildListingQueryParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        const actions = this.getPermissionActions();
        res.data.list.forEach((el) => (el.action = actions));
        this.whatWeDoList = new MatTableDataSource(res.data.list);
        this.totalData.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalData());
      });
  }

  editWhatWeDo(row: WhatWeDo) {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  deleteWhatWeDo(row: WhatWeDo) {
    this.dialogService.isLoading = true;
    this.whatWeDoService
      .delete(row._id)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.whatWeDoList.data.findIndex(
          (whatWeDo) => whatWeDo._id === row._id
        );
        this.whatWeDoList.data.splice(index, 1);
        this.whatWeDoList = new MatTableDataSource(this.whatWeDoList.data);
        this.totalData.update((value) => value - 1);
        this.vcTable.updateTotalRecords(this.totalData());
      });
  }

  onSearch(value: KeyValue) {
    this.vcTable.resetPageNumber();
    this.searchValue.set(value);
    this.getWhatWeDoList();
  }

  navigateToAdd() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }
}
