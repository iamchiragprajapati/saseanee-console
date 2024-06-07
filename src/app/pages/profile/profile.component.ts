import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';

import { REGEX } from '@constants/app.constants';
import { REGEX_TYPE } from '@constants/app.enums';
import { STORAGE } from '@constants/storage.constant';
import { AddMemberForm, Member } from '@models/member.model';
import { MemberService } from '@services/member.service';
import { StorageService } from '@services/storage.service';
import { ToasterService } from '@services/toaster.service';
import { UtilityService } from '@services/utility.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';
import { VcLoaderComponent } from '@vc-libs/vc-loader/vc-loader.component';
import { VcTelInputComponent } from '@vc-libs/vc-tel-input/vc-tel-input.component';
import { finalize } from 'rxjs';

const modules = [
  MatSlideToggleModule,
  FormsModule,
  ReactiveFormsModule,
  TranslateModule
];
const components = [
  VcButtonComponent,
  VcInputComponent,
  VcTelInputComponent,
  VcLoaderComponent
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ...modules, ...components],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  #destroyRef = inject(DestroyRef);
  addMemberForm: FormGroup<AddMemberForm>;
  isSubmitted = signal(false);
  member = signal<Member>(undefined);
  roles = signal<string>('');

  readonly emailRegex = REGEX.EMAIL;
  readonly regexType = REGEX_TYPE;

  constructor(
    private memberService: MemberService,
    private toasterService: ToasterService,
    private utilityService: UtilityService,
    private storageService: StorageService
  ) {}

  get formControls(): AddMemberForm {
    return this.addMemberForm.controls;
  }

  ngOnInit() {
    this.initializeForm();
    this.getProfileDetail();
  }

  initializeForm() {
    this.addMemberForm = new FormGroup<AddMemberForm>({
      isActive: new FormControl({ value: true, disabled: true }),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl(''),
      contact: new FormControl(),
      role: new FormControl([])
    });
  }

  getProfileDetail() {
    this.toasterService.displayLoader();
    this.memberService
      .getProfileDetail()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.toasterService.hideLoader())
      )
      .subscribe((res) => {
        this.member.set(res.data);
        this.roles.set(res.data.roles.map((role) => role.name).toString());
        this.addMemberForm.patchValue(res.data);
      });
  }

  updateDetail() {
    this.addMemberForm.markAllAsTouched();
    if (this.addMemberForm.invalid) {
      return;
    }

    this.isSubmitted.set(true);
    const payload = {
      firstName: this.addMemberForm.controls.firstName.value,
      lastName: this.addMemberForm.controls.lastName.value,
      roles: this.member().roles.map((role) => role._id),
      contact: this.addMemberForm.controls.contact.value,
      isActive: this.member().isActive
    };
    this.memberService
      .updateProfileDetail(
        this.member()._id,
        this.utilityService.removeNullBlankEmptyKeys(payload)
      )
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.storageService.set(
          STORAGE.FULL_NAME,
          `${payload.firstName} ${payload.lastName}`
        );
        this.toasterService.display(res.message);
      });
  }
}
