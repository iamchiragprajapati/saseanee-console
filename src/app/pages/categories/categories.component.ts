import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { APP, SORT_OPTIONS, STATUS } from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { Category } from '@models/category.model';
import { KeyValue, TableColumn } from '@models/common.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '@services/category.service';
import { DialogService } from '@services/dialog.service';
import { ToasterService } from '@services/toaster.service';
import { SearchField, SearchFieldType } from '@vc-libs/types';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSearchComponent } from '@vc-libs/vc-search/vc-search.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';
import { finalize } from 'rxjs';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [
  VcButtonComponent,
  VcActionToolbarComponent,
  VcInputComponent,
  VcTableComponent,
  SvgIconComponent,
  VcSearchComponent
];
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [DatePipe, NgClass, ...modules, ...components],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);

  categoryList = new MatTableDataSource<Category>();
  totalCategories = signal(0);
  columns = signal<TableColumn[]>([
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'title',
      label: 'common.name',
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
      label: 'common.status'
    }
  ]);
  sortColumns = computed(() =>
    this.columns()
      .filter((c) => c.sortable)
      .map((column) => ({
        key: column.key === 'name' ? 'firstName' : column.key,
        label: column.label
      }))
  );
  sortKey = signal(new FormControl<string>(undefined));
  sortValue = signal(new FormControl('desc'));
  searchFields = signal<SearchField[]>([
    {
      key: 'searchText',
      label: 'category.search',
      type: SearchFieldType.Text
    },
    {
      key: 'dateRange',
      label: 'common.date',
      type: SearchFieldType.DateRange
    },
    {
      key: 'status',
      label: 'common.status',
      type: SearchFieldType.List,
      list: STATUS
    }
  ]);
  searchValue = signal<KeyValue>(undefined);
  isLoading = signal(false);

  readonly sortOptions = SORT_OPTIONS;

  constructor(
    private route: ActivatedRoute,
    private categorySerive: CategoryService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,

  ) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void {
    this.isLoading.set(true);
    this.categoryList = new MatTableDataSource([]);
    this.categorySerive
      .get(this.buildListingQueryParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        const actions = this.getPermissionActions();
        res.data.list.forEach((el) => (el.action = actions));
        this.categoryList = new MatTableDataSource(res.data.list);
        this.totalCategories.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalCategories());
      });
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
      ...(this.searchValue()?.roles && { roles: this.searchValue().roles }),
      ...(this.searchValue()?.searchText && {
        search: this.searchValue().searchText as string
      }),
      ...(typeof this.searchValue()?.status === 'boolean' && {
        isActive: this.searchValue().status
      }),
      ...(this.sortKey().value && { sortBy: this.sortKey().value })
    };
  }

  getPermissionActions() {
    return [
      {
        label: 'common.edit',
        callback: this.editCategory.bind(this)
      },
      {
        label: 'common.delete',
        callback: this.deleteCategory.bind(this)
      }
    ];
  }

  editCategory(row: Category): void {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  async deleteCategory(row: Category): Promise<void> {
    this.dialogService.isLoading = true;
    this.categorySerive
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
        const index = this.categoryList.data.findIndex(
          (category) => category._id === row._id
        );
        this.categoryList.data.splice(index, 1);
        this.categoryList = new MatTableDataSource(this.categoryList.data);
        this.totalCategories.update((value) => value - 1);
        this.vcTable.updateTotalRecords(this.totalCategories());
      });
  }

  onSearch(value: KeyValue) {
    this.vcTable.resetPageNumber();
    this.searchValue.set(value);
    this.getCategories();
  }

  navigateToAdd() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }

}
