import { NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { LANGUAGES } from '@constants/app.constants';
import { MENU_TYPE } from '@constants/app.enums';
import { ROUTES } from '@constants/routes.enums';
import { STORAGE } from '@constants/storage.constant';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { StorageService } from '@services/storage.service';

const modules = [NgSelectModule, TranslateModule, FormsModule];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    ...modules,
    SvgIconComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  sideMenuOpen = signal(false);
  menuStates = signal<Record<`${MENU_TYPE}`, boolean>>({
    settings: false
  });

  readonly languages = LANGUAGES;
  readonly routes = ROUTES;
  readonly menuType = MENU_TYPE;
  readonly logo = environment.logo;

  constructor(
    private storageService: StorageService,
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {}

  get fullName() {
    return this.storageService.get(STORAGE.FULL_NAME);
  }

  ngOnInit() {
    this.breadcrumbService.toggleSidebar
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res: boolean) => {
        this.sideMenuOpen.set(res);
      });

    this.navSetup(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.navSetup(event.url);
      });
  }

  getMenuType(url: string): string {
    const menuMapping = {
      [this.routes.MEMBER]: MENU_TYPE.SETTINGS,
      [this.routes.CHANGE_PASSWORD]: MENU_TYPE.SETTINGS
    };

    for (const path in menuMapping) {
      if (url.startsWith(path)) {
        return menuMapping[path];
      }
    }

    return '';
  }

  navSetup(url: string) {
    const menuType = this.getMenuType(url);
    this.menuStates().settings = menuType === MENU_TYPE.SETTINGS;
    this.sideMenuOpen.set(false);
  }

  toggleSideMenu() {
    this.sideMenuOpen.update((value) => !value);
  }

  toggleMenu(menuType: `${MENU_TYPE}`) {
    for (const key in this.menuStates()) {
      this.menuStates()[key] =
        key === menuType ? !this.menuStates()[key] : false;
    }
  }
}
