import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import {
  ChangePasswordForm,
  ChangePasswordPayload,
  PasswordType
} from '@models/auth.model';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { CustomValidatorService } from '@services/validator.service';
import { VcButtonComponent } from '@vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from '@vc-libs/vc-input/vc-input.component';

const modules = [TranslateModule, ReactiveFormsModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ...modules, ...components],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  changePasswordForm: FormGroup<ChangePasswordForm>;
  isLoading = signal(false);
  passwordFieldType = signal<PasswordType>('password');
  confirmPasswordFieldType = signal<PasswordType>('password');
  oldPasswordFieldType = signal<PasswordType>('password');

  constructor(
    private customValidatorService: CustomValidatorService,
    private toasterService: ToasterService,
    private authService: AuthService
  ) {}

  get formControls(): ChangePasswordForm {
    return this.changePasswordForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.changePasswordForm = new FormGroup<ChangePasswordForm>(
      {
        oldPassword: new FormControl('', Validators.required),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(REGEX.PASSWORD)
        ]),
        confirmPassword: new FormControl('', Validators.required)
      },
      this.customValidatorService.passwordMatchValidator()
    );
  }

  changePassword(): void {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) return;
    this.isLoading.set(true);
    const params = {
      password: this.formControls.oldPassword.value,
      newPassword: this.formControls.password.value
    };
    this.authService
      .changePassword(params as ChangePasswordPayload)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((res) => {
        this.changePasswordForm.reset();
        this.passwordFieldType.set('password');
        this.confirmPasswordFieldType.set('password');
        this.oldPasswordFieldType.set('password');
        this.toasterService.display(res.message);
      });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType.update((value) =>
      value === 'password' ? 'text' : 'password'
    );
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordFieldType.update((value) =>
      value === 'password' ? 'text' : 'password'
    );
  }

  toggleOldPasswordVisibility(): void {
    this.oldPasswordFieldType.update((value) =>
      value === 'password' ? 'text' : 'password'
    );
  }
}
