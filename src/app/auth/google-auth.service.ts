import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly CLIENT_ID = '214922698115-lsq51vuo1k32l9nknl96nu6bccrlfb48.apps.googleusercontent.com';

  constructor(private http: HttpClient) {}

  /**
   * Inicializa Google Identity Services
   */
  initializeGoogleSignIn(callback: (response: any) => void): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: callback
      });
    }
  }

  /**
   * Renderiza el botón de Google
   */
  renderButton(element: HTMLElement): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        element,
        {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'continue_with'
        }
      );
    }
  }

  /**
   * Muestra el One Tap prompt
   */
  prompt(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    }
  }

  /**
   * Envía el credential token al backend
   */
  loginWithGoogle(credential: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/google`, { credential });
  }

  /**
   * Verifica si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Guarda el token y datos del usuario
   */
  saveSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtiene los datos del usuario
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}