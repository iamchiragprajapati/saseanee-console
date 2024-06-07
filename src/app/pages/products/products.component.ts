import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { APP, PAYMENT_STATUS, SORT_OPTIONS, STATUS, YES_NO_OPTIONS } from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { KeyValue, OptionDetail, TableColumn } from '@models/common.model';
import { Product } from '@models/product.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByPipe } from '@pipes/order-by.pipe';
import { CategoryService } from '@services/category.service';
import { DialogService } from '@services/dialog.service';
import { ProductService } from '@services/product.service';
import { ToasterService } from '@services/toaster.service';
import { ListSearchField, SearchField, SearchFieldType } from '@vc-libs/types';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSearchComponent } from '@vc-libs/vc-search/vc-search.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';
import { finalize } from 'rxjs';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [VcButtonComponent, VcActionToolbarComponent, VcInputComponent, VcTableComponent,
  SvgIconComponent, VcSearchComponent];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [DatePipe, NgClass, ...modules, ...components],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);

  productList = new MatTableDataSource<Product>();
  totalProducts = signal(0);
  categoryId: string;
  prefillValue: KeyValue;
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
      key: 'type',
      label: 'product.category'
    },
    {
      key: 'createdAt',
      label: 'common.date',
      sortable: true
    },
    {
      key: 'link',
      label: 'product.link',
    },
    {
      key: 'isPaid',
      label: 'product.paid',
      sortable: true
    },
    {
      key: 'isActive',
      label: 'common.status'
    },
    {
      key: 'isHighlighted',
      label: 'common.highlighted',
      sortable: true
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
  private _searchFields: SearchField[] = [
    {
      key: 'searchText',
      label: 'product.search',
      type: SearchFieldType.Text
    },
    {
      key: 'dateRange',
      label: 'common.date',
      type: SearchFieldType.DateRange
    },
    {
      key: 'categoryId',
      label: 'breadcrumbs.categoryList',
      type: SearchFieldType.List,
      list: []
    },
    {
      key: 'status',
      label: 'common.status',
      type: SearchFieldType.List,
      list: STATUS
    },
    {
      key: 'isPaid',
      label: 'product.paid',
      type: SearchFieldType.List,
      list: PAYMENT_STATUS
    },
    {
      key: 'isHighlighted',
      label: 'common.highlighted',
      type: SearchFieldType.List,
      list: YES_NO_OPTIONS
    }
  ];
  searchValue = signal<KeyValue>(undefined);
  isLoading = signal(false);

  readonly sortOptions = SORT_OPTIONS;

  get searchFields(): SearchField[] {
    return this._searchFields;
  }

  set searchFields(fields: SearchField[]) {
    this._searchFields = fields;
  }

  constructor(
    private route: ActivatedRoute,
    private productSerive: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
  }

  getProducts(): void {
    this.isLoading.set(true);
    this.productList = new MatTableDataSource([]);
    this.productSerive
      .get(this.buildListingQueryParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        const actions = this.getPermissionActions();
        res.data.list.forEach((el) => (el.action = actions));
        this.productList = new MatTableDataSource(res.data.list);
        this.totalProducts.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalProducts());
      });
  }

  getCategories() {
    this.categoryService
      .getCategoryList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        const index = this._searchFields.findIndex(
          (el) => el.key === 'categoryId'
        );
        this.setSearchFieldDynamicValue(index, res);
        this.categoryId &&
          (this.prefillValue = { key: 'categoryId', value: this.categoryId });
      });
  }

  setSearchFieldDynamicValue(index: number, options: OptionDetail[]) {
    if (
      index !== -1 &&
      this._searchFields[index].type === SearchFieldType.List
    ) {
      const filterPipe = new OrderByPipe();
      const fiteredArrs = filterPipe.transform(options, 'label');
      (this._searchFields[index] as ListSearchField).list = fiteredArrs;
    }
    this.searchFields = [...this._searchFields];
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
      ...(this.searchValue()?.categoryId && {
        categoryId: this.searchValue()?.categoryId
      }),
      ...(typeof this.searchValue()?.status === 'boolean' && {
        isActive: this.searchValue().status
      }),
      ...(typeof this.searchValue()?.isPaid === 'boolean' && {
        isPaid: this.searchValue().isPaid
      }),
      ...(typeof this.searchValue()?.isHighlighted === 'boolean' && {
        isHighlighted: this.searchValue().isHighlighted
      }),
      ...(this.sortKey().value && { sortBy: this.sortKey().value })
    };
  }

  getPermissionActions() {
    return [
      {
        label: 'common.edit',
        callback: this.editProduct.bind(this)
      },
      {
        label: 'common.delete',
        callback: this.deleteProduct.bind(this)
      }
    ];
  }

  editProduct(row: Product): void {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  async deleteProduct(row: Product): Promise<void> {
    this.dialogService.isLoading = true;
    this.productSerive
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
        const index = this.productList.data.findIndex(
          (product) => product._id === row._id
        );
        this.productList.data.splice(index, 1);
        this.productList = new MatTableDataSource(this.productList.data);
        this.totalProducts.update((value) => value - 1);
        this.vcTable.updateTotalRecords(this.totalProducts());
      });
  }

  onSearch(value: KeyValue) {
    this.vcTable.resetPageNumber();
    this.searchValue.set(value);
    this.getProducts();
  }

  navigateToAdd() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }

}
