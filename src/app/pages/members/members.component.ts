import { DatePipe, NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { DateRange } from '@angular/material/datepicker';
import { APP, SORT_OPTIONS, STATUS } from '@constants/app.constants';
import { Confirm } from '@decorators/confirm.decorator';
import { HasPermissionDirective } from '@directives/has-permission.directive';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { KeyValue, OptionsDetail, TableColumn } from '@models/common.model';
import { Member } from '@models/member.model';
import { DialogService } from '@services/dialog.service';
import { MemberService } from '@services/member.service';
import { RoleService } from '@services/role.service';
import { ToasterService } from '@services/toaster.service';
import { ListSearchField, SearchField, SearchFieldType } from '@vc-libs/types';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcSearchComponent } from '@vc-libs/vc-search/vc-search.component';
import { VcTableComponent } from '@vc-libs/vc-table/vc-table.component';

const modules = [ReactiveFormsModule, TranslateModule, NgSelectModule];
const components = [
  VcButtonComponent,
  VcActionToolbarComponent,
  VcInputComponent,
  VcTableComponent,
  SvgIconComponent,
  VcSearchComponent
];
const directives = [HasPermissionDirective];

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [DatePipe, NgClass, ...modules, ...components, ...directives],
  templateUrl: './members.component.html'
})
export class MembersComponent implements OnInit {
  @ViewChild(VcTableComponent) private vcTable: VcTableComponent;
  #destroyRef = inject(DestroyRef);

  memberList = new MatTableDataSource<Member>();
  totalMembers = signal(0);
  columns = signal<TableColumn[]>([
    {
      key: 'action',
      label: 'common.action'
    },
    {
      key: 'name',
      label: 'common.name',
      sortable: true
    },
    {
      key: 'email',
      label: 'member.email'
    },
    {
      key: 'role',
      label: 'member.roles'
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
  roleList = signal<OptionsDetail[]>([]);
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
      label: 'common.searchForUsers',
      type: SearchFieldType.Text
    },
    {
      key: 'roles',
      label: 'member.roles',
      type: SearchFieldType.List,
      list: this.roleList()
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
    private memberService: MemberService,
    private router: Router,
    private toasterService: ToasterService,
    private dialogService: DialogService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.getMembers();
    this.getRoleList();
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
      ...(this.searchValue()?.roles && { roles: this.searchValue().roles }),
      ...(this.searchValue()?.searchText && {
        searchText: this.searchValue().searchText
      }),
      ...(typeof this.searchValue()?.status === 'boolean' && {
        isActive: this.searchValue().status
      }),
      ...(this.sortKey().value && { sortFields: this.sortKey().value })
    };
  }

  getPermissionActions() {
    return [
      {
        label: 'common.edit',
        callback: this.editMember.bind(this)
      },
      {
        label: 'common.delete',
        callback: this.deleteMember.bind(this)
      }
    ];
  }

  getMembers(): void {
    this.isLoading.set(true);
    this.memberList = new MatTableDataSource([]);
    this.memberService
      .getMembers(this.buildListingQueryParams())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        const actions = this.getPermissionActions();
        res.data.list.forEach((el) => (el.action = actions));
        this.memberList = new MatTableDataSource(res.data.list);
        this.totalMembers.set(res.data.total);
        this.vcTable.updateTotalRecords(this.totalMembers());
      });
  }

  getRoleList(): void {
    this.roleService
      .getRoleList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        this.roleList.set(res);
        const index = this.searchFields().findIndex((el) => el.key === 'roles');
        (this.searchFields()[index] as ListSearchField).list = res;
      });
  }

  editMember(row: Member): void {
    this.router.navigate([`../${row._id}`], { relativeTo: this.route });
  }

  @Confirm()
  async deleteMember(row: Member): Promise<void> {
    this.dialogService.isLoading = true;
    this.memberService
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
        const index = this.memberList.data.findIndex(
          (member) => member._id === row._id
        );
        this.memberList.data.splice(index, 1);
        this.memberList = new MatTableDataSource(this.memberList.data);
        this.totalMembers.update((value) => value - 1);
        this.vcTable.updateTotalRecords(this.totalMembers());
      });
  }

  onSearch(value: KeyValue) {
    this.vcTable.resetPageNumber();
    this.searchValue.set(value);
    this.getMembers();
  }

  navigateToAddMember() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }
}
