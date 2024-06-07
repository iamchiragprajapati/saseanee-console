import { Component, HostBinding, effect, input } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgIcon } from '@models/common.model';

@Component({
  selector: 'app-vc-svg-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './vc-svg-icon.component.html',
  styleUrls: ['./vc-svg-icon.component.scss']
})
export class VcSvgIconComponent {
  @HostBinding('style.-webkit-mask-image') svgName: string;

  svgImageData = input<SvgIcon>();

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    effect(() => {
      this.svgName = this.svgImageData().name;
      this.matIconRegistry.addSvgIcon(
        this.svgImageData().name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.svgImageData().path
        )
      );
    });
  }
}
