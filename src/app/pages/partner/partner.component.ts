import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { APP, PARTNER_MODES, SORT_OPTIONS, STATUS } from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { ActionToolbar, KeyValue, TableColumn } from '@models/common.model';
import { Heading } from '@models/heading.model';
import { Partner } from '@models/partner.model';
import { DialogService } from '@services/dialog.service';
import { PartnerService } from '@services/partner.service';
import { ToasterService } from '@services/toaster.service';
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
  selector: 'app-partner',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    DatePipe,
    TitleCasePipe,
    ...modules, ...components
  ],
  templateUrl: './partner.component.html'
})
export class PartnerComponent {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);

  partnerList = new MatTableDataSource<Partner>();
  totalData = signal(0);
  columns = signal<TableColumn[]>([
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'contactPerson',
      label: 'common.name',
      sortable: true
    },
    {
      key: 'email',
      label: 'partner.email',
      sortable: true
    },
    {
      key: 'organization',
      label: 'partner.organization',
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
      key: 'mode',
      label: 'common.mode',
      sortable: true
    },
    {
      key: 'isActive',
      label: 'common.status',
      sortable: true
    }
  ]);
  sortColumns = computed(() => this.columns().filter((c) => c.sortable));
  sortKey = signal(new FormControl<string>(undefined));
  sortValue = signal(new FormControl('desc'));
  searchFields = signal<SearchField[]>([
    {
      key: 'searchText',
      label: 'partner.search',
      type: SearchFieldType.Text
    },
    {
      key: 'mode',
      label: 'common.mode',
      type: SearchFieldType.List,
      list: PARTNER_MODES
    },
    {
      key: 'isActive',
      label: 'common.status',
      type: SearchFieldType.List,
      list: STATUS
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
    private partnerService: PartnerService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getPartners();
  }

  buildListingQueryParams() {
    const dateRange = this.searchValue()?.dateRange as DateRange<Date>;
    const startDate = dateRange?.start ? dateRange.start.toISOString() : null;
    const endDate = dateRange?.end ? dateRange.end.toISOString() : null;
    return {
      sortValue: this.sortValue().value,
      limit: this.vcTable?.paginator?.pageSize || APP.PAGE_SIZE,
      page: this.vcTable?.paginator?.pageIndex + 1 || APP.PAGE_INDEX,
      isDeleted: false,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(this.searchValue()?.searchText && {
        searchText: this.searchValue().searchText
      }),
      ...(this.searchValue()?.mode && {
        mode: this.searchValue().mode
      }),
      ...(typeof this.searchValue()?.isActive === 'boolean' && {
        isActive: this.searchValue().isActive
      }),
      ...(this.sortKey().value && { sortFields: this.sortKey().value })
    };
  }

  getPermissionActions(): ActionToolbar[] {
    return [
      {
        label: 'common.edit',
        callback: this.editHeading.bind(this)
      },
      {
        label: 'common.delete',
        callback: this.deleteHeading.bind(this)
      }
    ];
  }

  getPartners(): void {
    this.isLoading.set(true);
    this.partnerList = new MatTableDataSource([]);
    this.partnerService
      .get(this.buildListingQueryParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.detectChanges();
        }),
      ).subscribe((res) => {
        const actions = this.getPermissionActions();
        res.data.list.forEach((el) => (el.action = actions));
        this.partnerList = new MatTableDataSource(res.data.list);
        this.totalData.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalData());
        this.cdr.detectChanges();
      });
  }

  editHeading(row: Heading) {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  deleteHeading(row: Heading) {
    this.dialogService.isLoading = true;
    this.partnerService
      .delete(row._id)
      .pipe(
        finalize(() => {
          this.dialogService.closeConfirmDialog();
          this.dialogService.isLoading = false;
        })
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        const index = this.partnerList.data.findIndex(
          (heading) => heading._id === row._id
        );
        this.partnerList.data.splice(index, 1);
        this.partnerList = new MatTableDataSource(this.partnerList.data);
        this.totalData.update((value) => value - 1);
        this.vcTable.updateTotalRecords(this.totalData());
      });
  }

  onSearch(value: KeyValue) {
    this.vcTable.resetPageNumber();
    this.searchValue.set(value);
    this.getPartners();
  }

  navigateToAdd() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }
}
