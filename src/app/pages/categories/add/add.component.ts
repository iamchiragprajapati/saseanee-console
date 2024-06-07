import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { AddCategoryForm, Category } from '@models/category.model';
import { APIResponseModel } from '@models/common.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { CategoryService } from '@services/category.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { finalize } from 'rxjs';

const modules = [
  MatSlideToggleModule,
  NgSelectModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule
];
const components = [VcButtonComponent, VcInputComponent];

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  _id = input<string>();
  categoryDetail = input<APIResponseModel<Category>>();
  addCategoryForm: FormGroup<AddCategoryForm>;
  isSubmitted = signal(false);

  get formControls(): AddCategoryForm {
    return this.addCategoryForm.controls;
  }

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private toasterService: ToasterService,
    private router: Router,
    private customValidatorService: CustomValidatorService,
    private breadcrumbService: BreadcrumbService,
  ) { }

  ngOnInit() {
    this.initializeForm();
    if (this._id()) {
      this.addCategoryForm.patchValue(this.categoryDetail().data);
      this.emitBreadcrumbDetail();
    }
  }

  emitBreadcrumbDetail(): void {
    this.breadcrumbService.emitBreadcrumbsDetail({
      breadcrumbs: this.route.snapshot.data.breadcrumbs,
      showLastItemCustomLabel: true,
      customItemLabel: this.categoryDetail().data.title
    });
  }

  initializeForm() {
    this.addCategoryForm = new FormGroup<AddCategoryForm>({
      title: new FormControl('', [
        Validators.required,
        this.customValidatorService.notWhitespace
      ]),
      index: new FormControl(0, Validators.required),
      isActive: new FormControl(true, Validators.required),
    });
  }

  onSubmit() {
    this.addCategoryForm.markAllAsTouched();
    if (this.addCategoryForm.invalid) {
      return;
    }

    this.isSubmitted.set(true);
    if (!this._id()) {
      this.addCategory();
    } else {
      this.updateCategory();
    }
  }

  addCategory(): void {
    this.categoryService
      .create(this.addCategoryForm.value)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  updateCategory(): void {
    this.categoryService
      .update(this._id(), this.addCategoryForm.value)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.navigateToList();
      });
  }

  navigateToList() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
