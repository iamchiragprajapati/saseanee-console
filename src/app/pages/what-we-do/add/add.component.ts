import {
  Component,
  DestroyRef,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { NgClass, NgFor, NgTemplateOutlet } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  APP,
  MEDIA_EXTENSION,
  MEDIA_RATIO,
  MEDIA_SIZE
} from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import {
  APIResponseModel
} from '@models/common.model';
import { AddWhatWeDoForm, WhatWeDoDetail } from '@models/whatWeDo.model';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { DialogService } from '@services/dialog.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { CustomValidatorService } from '@services/validator.service';
import { WhatWeDoService } from '@services/what-we-do.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [ReactiveFormsModule, TranslateModule, MatSlideToggleModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];
const directives = [AllowNumberOnlyDirective];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    NgFor,
    ...modules,
    ...components,
    ...directives
  ],
  templateUrl: './add.component.html'
})
export class AddComponent {
  #destroyRef = inject(DestroyRef);
  _id = input<string>();
  whatWeDoDetail = input<APIResponseModel<WhatWeDoDetail>>();

  addWhatWeDoForm: FormGroup<AddWhatWeDoForm>;
  isSubmitted = signal(false);
  logoExtension = signal('');

  readonly imageType = APP.IMAGE_TYPE;
  readonly extension = MEDIA_EXTENSION.IMAGE;
  readonly size = MEDIA_SIZE.IMAGE;
  readonly ratio = MEDIA_RATIO.HEADING;
  readonly integer = REGEX_TYPE.INTEGER;

  constructor(
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private router: Router,
    private dialogService: DialogService,
    private utilityService: UtilityService,
    private breadcrumbService: BreadcrumbService,
    private customValidatorService: CustomValidatorService,
    private whatWeDoService: WhatWeDoService
  ) { }

  get formControls(): AddWhatWeDoForm {
    return this.addWhatWeDoForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    if (this._id()) {
      const whatWeDoData = this.whatWeDoDetail().data;
      this.patchFormValue(whatWeDoData);
      this.emitBreadcrumbDetail();
    }
  }

  patchFormValue(formData) {
    const bulletPointsArray = this.addWhatWeDoForm.get('bulletPoints') as FormArray;
    bulletPointsArray.clear();
    formData.bulletPoints.forEach(point => {
      bulletPointsArray.push(new FormControl(point, [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]));
    });
    this.addWhatWeDoForm.patchValue(formData);
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.whatWeDoDetail().data.title
    });
  }

  initializeForm() {
    this.addWhatWeDoForm = new FormGroup<AddWhatWeDoForm>({
      title: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      subTitle: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      logo: new FormControl(null, Validators.required),
      bulletPoints: new FormArray([
        new FormControl('', [
          Validators.required,
          this.customValidatorService.notWhitespace
        ]),
      ]),
      isActive: new FormControl(true),
      isHighlighted: new FormControl(true),
      index: new FormControl(null)
    });
  }

  async onFileChange(event: Event) {
    const imageDetail = await this.utilityService.handleImageFileInput(event);
    const fileExtension = this.utilityService.getFileExtension(
      imageDetail.file
    );
    this.logoExtension.set(fileExtension === 'jpg' ? 'jpeg' : fileExtension);
    this.formControls.logo.setValue(imageDetail);
  }

  @Confirm()
  removeImage(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.formControls.logo.setValue(null);
    this.dialogService.closeConfirmDialog();
  }

  onSubmit() {
    this.addWhatWeDoForm.markAllAsTouched();
    if (this.addWhatWeDoForm.invalid) {
      return;
    }

    this.isSubmitted.set(true);
    if (!this._id()) {
      this.addWhatWeDo();
    } else {
      this.updateWhatWeDo();
    }
  }

  addWhatWeDo() {
    this.whatWeDoService
      .createWhatWeDo(this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  updateWhatWeDo() {
    this.whatWeDoService
      .updateWhatWeDo(this._id(), this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  getPayload(): FormData {
    const formData = new FormData();
    Object.keys(this.formControls).forEach(key => {
      const control = this.formControls[key];
      if (typeof control.value === 'boolean') {
        formData.append(key, control.value.toString());
      } else if (control.value?.file) {
        formData.append(key, control.value.file);
      } else if (control instanceof FormArray) {
        formData.append(key, JSON.stringify(control.value));
      } else {
        formData.append(key, control.value);
      }
    });
    return formData;
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  addBulletPoint() {
    (this.formControls.bulletPoints as FormArray).push(
      new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
    );
  }

  @Confirm()
  deleteBulletPoint(index: number) {
    this.addWhatWeDoForm.controls.bulletPoints.removeAt(index);
    this.dialogService.closeConfirmDialog();
  }
}
