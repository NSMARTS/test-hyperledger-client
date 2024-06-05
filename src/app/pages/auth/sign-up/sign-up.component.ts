import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

export const comparePasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { isNotMatched: true }
    : null;
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, MaterialsModule,],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private fb = inject(FormBuilder)
  private router = inject(Router)
  private authService = inject(AuthService)


  companies: any[] = [
    'naver',
    'delivery',
    'restaurant',
  ]


  signUpForm: FormGroup = this.fb.group({
    selectedCompany: ['naver', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    auth: ['admin', [Validators.required]]
  }, {
    validators: comparePasswordValidator
  });

  signUp() {
    console.log(this.signUpForm.value)
    this.authService.signUp(this.signUpForm.value).subscribe({
      next: () => {
        this.router.navigate(['/sign-in'])
      },
      error: () => { }
    })
  }

  cancel() {

  }


}
