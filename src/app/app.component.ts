import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

import { Component, OnInit, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { UploadMediaDetail } from '@models/common.model';
import { MediaUploadService } from '@services/media-upload.service';
import { StorageService } from '@services/storage.service';
import { ToasterService } from '@services/toaster.service';
import { VcMediaProgressComponent } from '@vc-libs/vc-media-progress/vc-media-progress.component';
import { VcMediaUploadComponent } from '@vc-libs/vc-media-upload/vc-media-upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SvgIconComponent,
    VcMediaProgressComponent,
    VcMediaUploadComponent
  ],
  templateUrl: './app.component.html',
  animations: [
    trigger('progressState', [
      state('show', style({ width: '100%' })),
      state('hide', style({ width: 0, height: 0 })),
      transition('hide => show', animate('0.5s ease-in'))
    ])
  ]
})
export class AppComponent implements OnInit {
  showLoader = signal(true);

  constructor(
    private storageService: StorageService,
    private router: Router,
    private mediaUploadService: MediaUploadService,
    private toasterService: ToasterService
  ) {
    this.router.events.subscribe((routerEvent) => {
      if (routerEvent instanceof NavigationStart) {
        this.showLoader.set(true);
      }
      const eventType = [NavigationEnd, NavigationCancel, NavigationError];
      if (eventType.some((event) => routerEvent instanceof event)) {
        this.showLoader.set(false);
      }
    });
  }

  get uploadedMediaList(): UploadMediaDetail[] {
    return this.mediaUploadService.mediaDetail;
  }

  ngOnInit() {
    this.toasterService.showLoader$.subscribe((res) =>
      setTimeout(() => this.showLoader.set(res))
    );
    this.storageService.setLanguage();
  }
}
