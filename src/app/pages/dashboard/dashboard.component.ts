import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet
} from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ROUTES } from '@constants/routes.enums';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { Artefacts, DashboardCounts } from '@models/dashboard.model';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '@services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    TranslateModule,
    SvgIconComponent,
    CurrencyPipe,
    NgTemplateOutlet
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  dashboardCounts = signal<DashboardCounts>(undefined);
  artefacts = signal<Artefacts[]>([]);
  isLoading = signal(false);
  artefactLoading = signal(false);
  skeletonItems = Array;

  readonly routes = ROUTES;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadCounts();
    this.getArtefacts();
  }

  loadCounts() {
    this.isLoading.set(true);
    this.dashboardService
      .getCounts()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => this.dashboardCounts.set(res.data));
  }

  getArtefacts() {
    this.artefactLoading.set(true);
    this.dashboardService
      .getArtefacts()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.artefactLoading.set(false))
      )
      .subscribe((res) => this.artefacts.set(res.data));
  }
}
