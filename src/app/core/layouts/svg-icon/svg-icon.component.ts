import { Component, computed, input } from '@angular/core';

import { SVG_ICONS } from '@constants/svg-icon.constants';
import { SvgIcon } from '@models/common.model';
import { VcSvgIconComponent } from '@vc-libs/vc-svg-icon/vc-svg-icon.component';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [VcSvgIconComponent],
  templateUrl: './svg-icon.component.html'
})
export class SvgIconComponent {
  name = input<(typeof SVG_ICONS)[number]['name']>();
  iconSvg = computed<SvgIcon>(() =>
    SVG_ICONS.find((i) => i.name === this.name())
  );
}
