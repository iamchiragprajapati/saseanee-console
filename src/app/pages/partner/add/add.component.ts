import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { APP, MEDIA_EXTENSION, MEDIA_SIZE, PARTNER_MODES, REGEX } from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { APIResponseModel } from '@models/common.model';
import { AddPartnerForm, PartnerDetail } from '@models/partner.model';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { DialogService } from '@services/dialog.service';
import { PartnerService } from '@services/partner.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcTelInputComponent } from '@vc-libs/vc-tel-input/vc-tel-input.component';

const modules = [ReactiveFormsModule, TranslateModule, MatSlideToggleModule, NgSelectModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent, VcTelInputComponent];
const directives = [AllowNumberOnlyDirective];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    ...modules,
    ...components,
    ...directives
  ],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  _id = input<string>();
  partnerDetail = input<APIResponseModel<PartnerDetail>>();
  logoExtension = signal('');

  addPartnerForm: FormGroup<AddPartnerForm>;
  isSubmitted = signal(false);

  readonly imageType = APP.IMAGE_TYPE;
  readonly extension = MEDIA_EXTENSION.IMAGE;
  readonly size = MEDIA_SIZE.IMAGE;
  readonly integer = REGEX_TYPE.INTEGER;
  readonly modes = PARTNER_MODES;

  constructor(
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private toasterService: ToasterService,
    private router: Router,
    private dialogService: DialogService,
    private utilityService: UtilityService,
    private customValidatorService: CustomValidatorService,
    private breadcrumbService: BreadcrumbService
  ) { }

  get formControls(): AddPartnerForm {
    return this.addPartnerForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    if (this._id()) {
      const partnerData = this.partnerDetail().data;
      if (Array.isArray(partnerData.logo)) {
        partnerData.logo.length === 0 && (partnerData.logo = null);
      }
      this.addPartnerForm.patchValue(partnerData);
      this.emitBreadcrumbDetail();
    }
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.partnerDetail().data.contactPerson
    });
  }

  initializeForm() {
    this.addPartnerForm = new FormGroup<AddPartnerForm>({
      organization: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      contactPerson: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        this.customValidatorService.notWhitespace
      ]),
      contactNumber: new FormControl('', Validators.required),
      website: new FormControl('', [
        Validators.required,
        Validators.pattern(REGEX.WEBSITE),
        this.customValidatorService.notWhitespace
      ]),
      country: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      mode: new FormControl(null, [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      remark: new FormControl(''),
      isActive: new FormControl(true),
      isHighlighted: new FormControl(true),
      index: new FormControl(null),
      description: new FormControl(''),
      logo: new FormControl(null),
      videoLink: new FormControl('', [
        Validators.pattern(REGEX.VIDEO_LINK),
        this.customValidatorService.notWhitespace
      ]),
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
    this.logoExtension.set('');
    this.dialogService.closeConfirmDialog();
  }

  onSubmit() {
    this.addPartnerForm.markAllAsTouched();
    if (this.addPartnerForm.invalid) {
      return;
    }
    this.isSubmitted.set(true);
    if (!this._id()) {
      this.addHeading();
    } else {
      this.updateHeading();
    }
  }

  addHeading() {
    this.partnerService
      .createPartner(this.getPayload())
      .pipe(
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  updateHeading() {
    this.partnerService
      .updatePartner(this._id(), this.getPayload())
      .pipe(
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  getPayload(): FormData {
    const formData = new FormData();
    const data = this.utilityService.removeNullBlankEmptyKeys(this.addPartnerForm.value);
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'boolean' || typeof value === 'number') {
        formData.append(key, value.toString());
      }
      else {
        formData.append(key, value);
      }
    });
    if (this.formControls.logo.value?.file) {
      formData.append('logo', this.formControls.logo.value.file);
    }
    return formData;
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}