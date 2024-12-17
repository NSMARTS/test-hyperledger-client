import { AuthService } from './../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  authService = inject(AuthService);
  router = inject(Router);

  companies: any[] = [
    {
      name: '네이버',
      value: 'NaverMSP',
    },
    {
      name: '배달업체',
      value: 'DeliveryMSP',
    },
    {
      name: '음식점',
      value: 'RestaurantMSP',
    },
  ];
  companyControl = new FormControl(this.companies[0].value, [
    Validators.required,
  ]);

  emailControl = new FormControl('', [Validators.required, Validators.email]);

  passwordControl = new FormControl('', [Validators.required]);

  form: FormGroup = new FormGroup({
    org: this.companyControl,
    email: this.emailControl,
    password: this.passwordControl,
  });

  signIn() {
    this.authService.signIn(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {},
    });
  }
}
