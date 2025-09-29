import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  activeTab: 'login' | 'signup' = 'login';
  loginForm: FormGroup;
  signupForm: FormGroup;
  loading = false;
  loadingMessage = '';
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  ngOnInit(): void {
    // Let the GuestGuard handle authentication redirects
    // No need to check auth state here as the guard will handle it
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  // Switch between login and signup tabs
  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.loginForm.reset();
    this.signupForm.reset();
  }

  // Handle login - Updated to handle Observable
  onLogin(): void {
    console.log('AuthComponent: onLogin() called');
    console.log('AuthComponent: activeTab:', this.activeTab);
    console.log('AuthComponent: loginForm valid:', this.loginForm.valid);
    
    if (this.loginForm.valid) {
      this.loading = true;
      this.loadingMessage = 'Signing you in...';
      this.errorMessage = '';

      const { email, password, rememberMe } = this.loginForm.value;
      console.log('AuthComponent: Login form values:', { email, password: '***', rememberMe });
      
      console.log('AuthComponent: Calling authService.signIn()');
      this.authService.signIn(email, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('AuthComponent: Login success:', result);
            this.loadingMessage = 'Redirecting to inventory...';
            
            // Handle remember me
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', email);
            } else {
              localStorage.removeItem('rememberedEmail');
            }
            
            this.loading = false;
            // Success - auth service will handle redirect
          },
          error: (error) => {
            console.log('AuthComponent: Login error:', error);
            this.errorMessage = error.message || 'Login failed';
            this.loading = false;
            this.loadingMessage = '';
          }
        });
    } else {
      console.log('AuthComponent: Login form invalid, marking as touched');
      this.markFormGroupTouched(this.loginForm);
    }
  }

  // Handle signup - Updated to handle Observable
  onSignup(): void {
    console.log('AuthComponent: onSignup() called');
    console.log('AuthComponent: activeTab:', this.activeTab);
    console.log('AuthComponent: signupForm valid:', this.signupForm.valid);
    
    if (this.signupForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.signupForm.value;
      console.log('AuthComponent: Signup form values:', { email, password: '***' });
      
      console.log('AuthComponent: Calling authService.signUp()');
      this.authService.signUp(email, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('AuthComponent: Signup success:', result);
            this.loading = false;
            // Success - auth service will handle redirect
          },
          error: (error) => {
            console.log('AuthComponent: Signup error:', error);
            this.errorMessage = error.message || 'Sign up failed';
            this.loading = false;
          }
        });
    } else {
      console.log('AuthComponent: Signup form invalid, marking as touched');
      this.markFormGroupTouched(this.signupForm);
    }
  }

  // Mark all form fields as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Password reset functionality
  showForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.resetPassword(email);
    } else {
      // Show dialog to enter email
      this.openForgotPasswordDialog();
    }
  }

  private resetPassword(email: string): void {
    this.loading = true;
    this.loadingMessage = 'Sending password reset email...';
    this.errorMessage = '';

    this.authService.resetPassword(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.loadingMessage = '';
          this.errorMessage = '';
          // Show success message
          this.showSuccessMessage('Password reset email sent! Check your inbox.');
        },
        error: (error) => {
          this.loading = false;
          this.loadingMessage = '';
          this.errorMessage = error.message || 'Failed to send password reset email';
        }
      });
  }

  private openForgotPasswordDialog(): void {
    // Simple prompt for now - could be enhanced with a proper dialog
    const email = prompt('Enter your email address:');
    if (email) {
      this.resetPassword(email);
    }
  }

  private showSuccessMessage(message: string): void {
    // Simple alert for now - could be enhanced with a snackbar
    alert(message);
  }

  // Get error message for form field
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}