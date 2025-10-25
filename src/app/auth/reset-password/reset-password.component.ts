import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: []
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  loading = false;
  error = '';
  success = false;
  showPassword = false;
  showConfirmPassword = false;
  token: string | null = null;
  tokenValid = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.tokenValid = false;
      this.error = 'Token de recuperación no válido o faltante.';
      return;
    }

    // Crear formulario
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Verificar validez del token
    this.verifyToken();
  }

  /**
   * Verificar que el token sea válido
   */
  verifyToken(): void {
    if (!this.token) return;

    this.authService.verifyResetToken(this.token).subscribe({
      next: () => {
        this.tokenValid = true;
      },
      error: (err) => {
        this.tokenValid = false;
        if (err.status === 400) {
          this.error = 'El enlace de recuperación ha expirado o no es válido.';
        } else {
          this.error = 'Error al verificar el token. Por favor solicita un nuevo enlace.';
        }
      }
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  /**
   * Submit del formulario
   */
  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.loading = true;
    this.error = '';

    const { password } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error en reset password:', err);
        
        if (err.status === 400) {
          this.error = 'El enlace ha expirado. Por favor solicita uno nuevo.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al cambiar la contraseña. Por favor intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Ir a login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Solicitar nuevo enlace
   */
  requestNewLink(): void {
    this.router.navigate(['/forgot-password']);
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
    const control = this.resetPasswordForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.resetPasswordForm.get(field);
    
    if (!control || !control.touched) {
      return '';
    }

    const fieldNames: {[key: string]: string} = {
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña'
    };

    const fieldName = fieldNames[field] || field;

    if (control.hasError('required')) {
      return `${fieldName} es obligatorio`;
    }

    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }
}