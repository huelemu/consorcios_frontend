import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { GoogleAuthService } from '../google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;
  
  loginForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showRegisterView = false; // Para toggle con register

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Crear formulario de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Inicializar Google Sign-In
    this.googleAuthService.initializeGoogleSignIn(
      (response: any) => this.handleGoogleResponse(response)
    );
  }

  ngAfterViewInit(): void {
    // Renderizar el botón de Google después de que la vista esté lista
    if (this.googleButton) {
      this.googleAuthService.renderButton(this.googleButton.nativeElement);
    }
  }

  /**
   * Submit del formulario de login local
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.error = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        
        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.error = 'Email o contraseña incorrectos';
        } else if (err.status === 403) {
          this.error = 'Tu cuenta está inactiva. Contacta al administrador.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al iniciar sesión. Por favor intenta nuevamente.';
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
        console.log('Login con Google exitoso:', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en login con Google:', err);
        this.error = err.error?.message || 'Error al iniciar sesión con Google. Por favor intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Cambiar a vista de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
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
    const control = this.loginForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return `${field === 'email' ? 'Email' : 'Contraseña'} es obligatorio`;
    }

    if (control.hasError('email')) {
      return 'Email inválido';
    }

    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    return '';
  }
}