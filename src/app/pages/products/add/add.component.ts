import { NgClass, NgFor, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { APP, MEDIA_EXTENSION, MEDIA_RATIO, MEDIA_SIZE, REGEX } from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';
import { Confirm } from '@decorators/confirm.decorator';
import { AllowNumberOnlyDirective } from '@directives/allow-number-only.directive';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import { AddProductForm, ProductDetail } from '@models/product.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { CategoryService } from '@services/category.service';
import { DialogService } from '@services/dialog.service';
import { ProductService } from '@services/product.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';

const modules = [ReactiveFormsModule, TranslateModule, MatSlideToggleModule, NgSelectModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];
const directives = [AllowNumberOnlyDirective];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, NgFor, ...modules, ...components, ...directives],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  _id = input<string>();
  productDetail = input<APIResponseModel<ProductDetail>>();

  addProductForm: FormGroup<AddProductForm>;
  isSubmitted = signal(false);
  categories: OptionDetail[] = [];

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
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  get formControls(): AddProductForm {
    return this.addProductForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    this.getCategories();
    if (this._id()) {
      const productData = this.productDetail().data;
      this.addProductForm.patchValue(productData);
      this.emitBreadcrumbDetail();
    }
  }

  getCategories() {
    this.categoryService
      .getCategoryList()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((categories) => {
        this.categories = categories;
      });
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.productDetail().data.title
    });
  }

  initializeForm() {
    this.addProductForm = new FormGroup<AddProductForm>({
      title: new FormControl('', [Validators.required, this.customValidatorService.notWhitespace]),
      description: new FormControl('', [Validators.required, this.customValidatorService.notWhitespace]),
      link: new FormControl('', [Validators.required, Validators.pattern(REGEX.URL)]),
      type: new FormControl('', Validators.required),
      logo: new FormControl(null, Validators.required),
      index: new FormControl(null, Validators.required),
      isActive: new FormControl(true, Validators.required),
      isPaid: new FormControl(false, Validators.required),
      isHighlighted: new FormControl(false, Validators.required),
    });
  }

  async onFileChange(event: Event) {
    const images = await this.utilityService.handleMultipleImageFileInput(event);
    this.formControls.logo.setValue(images);
  }

  @Confirm()
  removeImage(fileInput: HTMLInputElement) {
    fileInput.value = '';
    this.formControls.logo.setValue(null);
    this.dialogService.closeConfirmDialog();
  }

  onSubmit() {
    this.addProductForm.markAllAsTouched();
    if (this.addProductForm.invalid) {
      return;
    }
    this.isSubmitted.set(true);
    if (this._id()) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
  }

  addProduct() {
    this.productService
      .createProduct(this.getPayload())
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  updateProduct() {
    this.productService
      .updateProduct(this._id(), this.getPayload())
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
      const value = control.value;
      if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          formData.append(key, value[i]);
        }
      } else {
        key !== 'logo' && formData.append(key, value);
      }
    });
    return formData;
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
