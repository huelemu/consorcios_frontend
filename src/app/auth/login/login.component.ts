import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;
  loading = false;
  error = '';

  constructor(
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  handleGoogleResponse(response: any): void {
    this.loading = true;
    this.error = '';

    // Enviar el credential al backend
    this.googleAuthService.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        
        // Guardar token y usuario
        this.googleAuthService.saveSession(res.token, res.user);
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Error en login:', err);
        this.error = 'Error al iniciar sesión. Por favor intenta nuevamente.';
        this.loading = false;
      }
    });
  }
}