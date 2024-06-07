import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { REGEX } from '@constants/app.constants';
import { environment } from '@environment/environment';
import { SvgIconComponent } from '@layouts/svg-icon/svg-icon.component';
import { PasswordType } from '@models/auth.model';
import { AuthService } from '@services/auth.service';
import { ToasterService } from '@services/toaster.service';
import { VcButtonComponent } from 'app/vc-libs/vc-button/vc-button.component';
import { VcInputComponent } from 'app/vc-libs/vc-input/vc-input.component';

const modules = [FormsModule, TranslateModule];
const components = [VcButtonComponent, VcInputComponent, SvgIconComponent];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, ...modules, ...components],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  #destroyRef = inject(DestroyRef);

  isSubmitted = signal(false);
  passwordFieldType = signal<PasswordType>('password');

  readonly logoURL = `${environment.logo}`;
  readonly emailRegex = REGEX.EMAIL;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toasterService: ToasterService
  ) { }

  onSubmit(loginForm: NgForm): boolean | void {
    if (loginForm.invalid) {
      return;
    }
    this.isSubmitted.set(true);
    this.authService
      .login(loginForm.value)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isSubmitted.set(false))
      )
      .subscribe((res) => {
        this.router.navigate(['/admin']).then(() => {
          this.toasterService.display(res.message);
        });
      });
  }

  navigateToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType.update((value) =>
      value === 'password' ? 'text' : 'password'
    );
  }
}
