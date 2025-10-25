import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  persona_id: number;
  email: string;
  username: string;
  nombre: string;
  apellido?: string;
  rol: string;
  picture?: string;
  primer_login?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  username?: string;
  documento?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Registro de usuario local
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.saveSession(response.token, response.user);
          }
        })
      );
  }

  /**
   * Login local (email/password)
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.saveSession(response.token, response.user);
          }
        })
      );
  }

  /**
   * Login con Google OAuth
   */
  googleLogin(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { credential })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.saveSession(response.token, response.user);
          }
        })
      );
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/profile`);
  }

  /**
   * Guardar sesión (token y usuario)
   */
  saveSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener usuario del localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si está logueado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Decodificar JWT (sin validar)
   */
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si el token está expirado
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  }

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Verificar validez del token de reset
   */
  verifyResetToken(token: string): Observable<any> {
  return this.http.get(`${environment.apiUrl}/auth/verify-reset-token/${token}`);
}

  /**
   * Resetear contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { 
      token, 
      newPassword 
    });
  }
}