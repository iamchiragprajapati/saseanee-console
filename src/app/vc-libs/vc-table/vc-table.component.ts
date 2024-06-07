import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
  input,
  output
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { APP } from '@constants/app.constants';
import { TableColumn } from '@models/common.model';
import { VcActionToolbarComponent } from '@vc-libs/vc-action-toolbar/vc-action-toolbar.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';

const modules = [MatTableModule, TranslateModule, MatPaginatorModule];
const components = [VcLoaderComponent, VcActionToolbarComponent];

@Component({
  selector: 'app-vc-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass,
    ...modules,
    ...components,
    CdkDrag,
    CdkDropList
  ],
  templateUrl: './vc-table.component.html',
  styleUrls: ['./vc-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VcTableComponent {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  data = input.required<MatTableDataSource<unknown, MatPaginator>>();
  name = input.required<string>();
  columns = input.required<TableColumn[]>();
  totalData = input.required<number>();
  requiredPagination = input(true);
  isLoading = input(false);
  dynamicColumnSlots = input<Record<string, TemplateRef<unknown>>>({});
  tableWidth = input('');
  unReadFeature = input(false);
  cdkDragDisabled = input(true);

  pageChanged = output<void>();
  dropRecord = output<CdkDragDrop<unknown[]>>();

  readonly pageSizeOptions = APP.PAGE_OPTIONS;

  get columnKeys(): string[] {
    return this.columns().map((c) => c.key);
  }

  emitPage() {
    this.pageChanged.emit();
  }

  isColumnDynamicSlot(column: string): boolean {
    return !!this.dynamicColumnSlots()[column];
  }

  resetPageNumber() {
    this.paginator.pageIndex = 0;
  }

  updateTotalRecords(len: number) {
    this.paginator.length = len;
  }

  drop(event: CdkDragDrop<unknown[]>): void {
    this.dropRecord.emit(event);
  }
}
