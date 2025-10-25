import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { GoogleAuthService } from '../google-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: []
})
export class RegisterComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;
  
  registerForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Crear formulario de registro
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      username: [''],
      documento: [''],
      telefono: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Inicializar Google Sign-In
    this.googleAuthService.initializeGoogleSignIn(
      (response: any) => this.handleGoogleResponse(response)
    );
  }

  ngAfterViewInit(): void {
    // Renderizar el botón de Google
    if (this.googleButton) {
      this.googleAuthService.renderButton(this.googleButton.nativeElement);
    }
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
   * Submit del formulario de registro
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.error = '';

    // Preparar datos (excluir confirmPassword y acceptTerms)
    const { confirmPassword, acceptTerms, ...registerData } = this.registerForm.value;

    // Limpiar campos opcionales vacíos
    Object.keys(registerData).forEach(key => {
      if (registerData[key] === '') {
        delete registerData[key];
      }
    });

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        
        // Manejar diferentes tipos de errores
        if (err.status === 409) {
          this.error = 'El email ya está registrado';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Datos inválidos. Por favor verifica los campos.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al registrar usuario. Por favor intenta nuevamente.';
        }
        
        this.loading = false;
      }
    });
  }

  /**
   * Manejo de respuesta de Google OAuth
   */
  handleGoogleResponse(response: any): void {
    this.loading = true;
    this.error = '';

    this.authService.googleLogin(response.credential).subscribe({
      next: (res) => {
        console.log('Registro con Google exitoso:', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en registro con Google:', err);
        this.error = err.error?.message || 'Error al registrar con Google. Por favor intenta nuevamente.';
        this.loading = false;
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
   * Marcar todos los campos del formulario como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(field: string, error: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    
    if (!control || !control.touched) {
      return '';
    }

    const fieldNames: {[key: string]: string} = {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      username: 'Nombre de usuario',
      documento: 'Documento',
      telefono: 'Teléfono',
      acceptTerms: 'Aceptar términos'
    };

    const fieldName = fieldNames[field] || field;

    if (control.hasError('required')) {
      return `${fieldName} es obligatorio`;
    }

    if (control.hasError('email')) {
      return 'Email inválido';
    }

    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    if (control.hasError('requiredTrue')) {
      return 'Debes aceptar los términos y condiciones';
    }

    return '';
  }
}