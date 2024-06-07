import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { environment } from '@environment/environment';
import { AuthPayload, ForgetPasswordForm } from '@models/auth.model';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { VcButtonComponent } from 'app/vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from 'app/vc-libs/vc-input/vc-input.component';

const modules = [TranslateModule, ReactiveFormsModule];
const components = [VcButtonComponent, VcInputComponent];

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgClass, ...modules, ...components],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  #destroyRef = inject(DestroyRef);

  isSubmitted = signal(false);
  forgotPasswordForm: FormGroup<ForgetPasswordForm>;

  readonly logoURL = `${environment.logo}`;
  readonly displayTitle = `${environment.title}`;
  readonly supportEmail = `${environment.email}`;
  readonly emailRegex = REGEX.EMAIL;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {
    this.forgotPasswordForm = new FormGroup<ForgetPasswordForm>({
      email: new FormControl('')
    });
  }

  get formControls() {
    return this.forgotPasswordForm.controls;
  }

  submitForm(): boolean | void {
    this.forgotPasswordForm.markAllAsTouched();
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitted.set(true);
    this.authService
      .forgotPassword(
        this.forgotPasswordForm.value as Pick<AuthPayload, 'email'>
      )
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.toasterService.display(res.message);
        this.router.navigate(['/auth/login']);
      });
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
