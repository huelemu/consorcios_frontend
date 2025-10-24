import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  // Envia el token de Google al backend
googleLogin(credential: string): Observable<any> {
  return this.http.post(`${environment.apiUrl}/auth/google/callback`, { 
    id_token: credential
  });
}

  // Verifica si el usuario tiene un JWT guardado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Cierra sesión borrando el token
  logout() {
    localStorage.removeItem('token');
  }
}