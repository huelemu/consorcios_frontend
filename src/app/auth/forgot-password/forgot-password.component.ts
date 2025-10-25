import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: []
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  step: 'email' | 'google-info' | 'email-sent' = 'email';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Submit del formulario
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const email = this.forgotPasswordForm.value.email;
    this.userEmail = email;

    // Llamar al endpoint de forgot password
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.loading = false;

        // Verificar si el usuario usa Google OAuth
        if (response.provider === 'google') {
          this.step = 'google-info';
        } else {
          this.step = 'email-sent';
          this.success = response.message || 'Se ha enviado un email con instrucciones para recuperar tu contraseña.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en forgot password:', err);
        
        if (err.status === 404) {
          this.error = 'No existe una cuenta con ese email.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al procesar la solicitud. Por favor intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Volver al login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Reintentar con otro email
   */
  tryAgain(): void {
    this.step = 'email';
    this.error = '';
    this.success = '';
    this.forgotPasswordForm.reset();
  }

  /**
   * Marcar todos los campos del formulario como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(field: string, error: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    
    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Email es obligatorio';
    }

    if (control.hasError('email')) {
      return 'Email inválido';
    }

    return '';
  }
}