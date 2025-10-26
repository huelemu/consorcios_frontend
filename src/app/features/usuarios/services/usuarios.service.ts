import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  UsuarioFilters,
  UsuariosResponse,
  UsuarioStats,
  AsignarRolDto,
  UsuarioRol
} from '../models/usuario.model';

/**
 * =========================================
 * USUARIOS SERVICE
 * =========================================
 * Servicio para gestión de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Obtener todos los usuarios (con filtros y paginación)
   */
  getUsuarios(filters?: UsuarioFilters): Observable<UsuariosResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.rol_global) params = params.set('rol_global', filters.rol_global);
      if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      if (filters.oauth_provider) params = params.set('oauth_provider', filters.oauth_provider);
      if (filters.email_verificado !== undefined) params = params.set('email_verificado', filters.email_verificado.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<UsuariosResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un usuario por ID
   */
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  createUsuario(usuario: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  /**
   * Actualizar un usuario existente
   */
  updateUsuario(id: number, usuario: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  /**
   * Eliminar un usuario (soft delete - desactivar)
   */
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========================================
  // ACTIVACIÓN / DESACTIVACIÓN
  // ========================================

  /**
   * Activar un usuario
   */
  activarUsuario(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/activar`, {});
  }

  /**
   * Desactivar un usuario
   */
  desactivarUsuario(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  // ========================================
  // GESTIÓN DE ROLES
  // ========================================

  /**
   * Obtener roles específicos de un usuario
   */
  getRolesByUsuario(usuarioId: number): Observable<UsuarioRol[]> {
    return this.http.get<UsuarioRol[]>(`${this.apiUrl}/${usuarioId}/roles`);
  }

  /**
   * Asignar un rol específico a un usuario
   */
  asignarRol(data: AsignarRolDto): Observable<UsuarioRol> {
    return this.http.post<UsuarioRol>(`${this.apiUrl}/roles/asignar`, data);
  }

  /**
   * Remover un rol específico de un usuario
   */
  removerRol(usuarioRolId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${usuarioRolId}`);
  }

  /**
   * Cambiar el rol global de un usuario
   */
  cambiarRolGlobal(usuarioId: number, nuevoRol: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${usuarioId}/rol`, { rol_global: nuevoRol });
  }

  // ========================================
  // CONTRASEÑAS Y SEGURIDAD
  // ========================================

  /**
   * Resetear contraseña de un usuario (envía email)
   */
  resetearPassword(usuarioId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${usuarioId}/reset-password`, {});
  }

  /**
   * Cambiar contraseña (por el propio usuario)
   */
  cambiarPassword(usuarioId: number, passwordActual: string, passwordNueva: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${usuarioId}/cambiar-password`, {
      password_actual: passwordActual,
      password_nueva: passwordNueva
    });
  }

  /**
   * Verificar email de usuario
   */
  verificarEmail(usuarioId: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${usuarioId}/verificar-email`, {});
  }

  // ========================================
  // INVITACIONES
  // ========================================

  /**
   * Enviar invitación a un usuario
   */
  enviarInvitacion(usuarioId: number): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; token: string }>(`${this.apiUrl}/${usuarioId}/invitar`, {});
  }

  /**
   * Reenviar invitación
   */
  reenviarInvitacion(usuarioId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${usuarioId}/reenviar-invitacion`, {});
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas de usuarios
   */
  getEstadisticas(): Observable<UsuarioStats> {
    return this.http.get<UsuarioStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtener usuarios por rol
   */
  getUsuariosByRol(rol: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/by-rol/${rol}`);
  }

  /**
   * Buscar usuarios disponibles para asignar (sin usuario todavía)
   */
  getPersonasSinUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personas-disponibles`);
  }

  // ========================================
  // BÚSQUEDA Y VALIDACIÓN
  // ========================================

  /**
   * Verificar si un email ya está en uso
   */
  verificarEmailDisponible(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('email', email);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/verificar-email`, { params });
  }

  /**
   * Verificar si un username ya está en uso
   */
  verificarUsernameDisponible(username: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('username', username);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/verificar-username`, { params });
  }

  /**
   * Buscar usuarios por término
   */
  buscarUsuarios(termino: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('q', termino)
    });
  }
}