import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Modulo, MisModulosResponse, ModuloConPermisos } from '../models/modulo.interface';

@Injectable({ providedIn: 'root' })
export class ModulosService {
  private modulosSubject = new BehaviorSubject<ModuloConPermisos[]>([]);
  public modulos$ = this.modulosSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los módulos del usuario autenticado desde el backend
   * Este es el endpoint principal que se debe llamar al iniciar sesión
   */
  getMisModulos(): Observable<MisModulosResponse> {
    return this.http.get<MisModulosResponse>(`${environment.apiUrl}/modulos/mis-modulos`)
      .pipe(
        tap(response => {
          if (response.success) {
            const modulosConPermisos = this.transformarModulos(response.data);
            this.modulosSubject.next(modulosConPermisos);
            // Guardar en localStorage para persistencia
            this.guardarModulosEnStorage(modulosConPermisos);
          }
        })
      );
  }

  /**
   * Transforma los módulos del backend a ModuloConPermisos
   */
  private transformarModulos(modulos: Modulo[]): ModuloConPermisos[] {
    return modulos
      .filter(m => m.activo && m.modulo_roles && m.modulo_roles.length > 0)
      .map(modulo => ({
        id: modulo.id,
        nombre: modulo.nombre,
        clave: modulo.clave,
        icono: modulo.icono,
        ruta: modulo.ruta,
        orden: modulo.orden,
        requiere_consorcio: modulo.requiere_consorcio,
        permisos: {
          ver: modulo.modulo_roles[0].puede_ver,
          crear: modulo.modulo_roles[0].puede_crear,
          editar: modulo.modulo_roles[0].puede_editar,
          eliminar: modulo.modulo_roles[0].puede_eliminar
        }
      }))
      .filter(m => m.permisos.ver) // Solo módulos que el usuario puede ver
      .sort((a, b) => a.orden - b.orden); // Ordenar por campo "orden"
  }

  /**
   * Guarda los módulos en localStorage
   */
  private guardarModulosEnStorage(modulos: ModuloConPermisos[]): void {
    localStorage.setItem('user_modules', JSON.stringify(modulos));
  }

  /**
   * Obtiene los módulos del localStorage
   */
  getModulosFromStorage(): ModuloConPermisos[] {
    const modulosJson = localStorage.getItem('user_modules');
    return modulosJson ? JSON.parse(modulosJson) : [];
  }

  /**
   * Obtiene los módulos actuales (desde el BehaviorSubject)
   */
  getModulosActuales(): ModuloConPermisos[] {
    return this.modulosSubject.value;
  }

  /**
   * Verifica si el usuario tiene un módulo específico
   */
  tieneModulo(clave: string): boolean {
    const modulos = this.modulosSubject.value.length > 0
      ? this.modulosSubject.value
      : this.getModulosFromStorage();

    return modulos.some(m => m.clave === clave && m.permisos.ver);
  }

  /**
   * Obtiene los permisos de un módulo específico
   */
  getPermisosModulo(clave: string): { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } | null {
    const modulos = this.modulosSubject.value.length > 0
      ? this.modulosSubject.value
      : this.getModulosFromStorage();

    const modulo = modulos.find(m => m.clave === clave);
    return modulo ? modulo.permisos : null;
  }

  /**
   * Verifica si el usuario puede ver un módulo
   */
  puedeVer(clave: string): boolean {
    const permisos = this.getPermisosModulo(clave);
    return permisos?.ver || false;
  }

  /**
   * Verifica si el usuario puede crear en un módulo
   */
  puedeCrear(clave: string): boolean {
    const permisos = this.getPermisosModulo(clave);
    return permisos?.crear || false;
  }

  /**
   * Verifica si el usuario puede editar en un módulo
   */
  puedeEditar(clave: string): boolean {
    const permisos = this.getPermisosModulo(clave);
    return permisos?.editar || false;
  }

  /**
   * Verifica si el usuario puede eliminar en un módulo
   */
  puedeEliminar(clave: string): boolean {
    const permisos = this.getPermisosModulo(clave);
    return permisos?.eliminar || false;
  }

  /**
   * Limpia los módulos (al hacer logout)
   */
  limpiarModulos(): void {
    this.modulosSubject.next([]);
    localStorage.removeItem('user_modules');
  }

  /**
   * Carga módulos desde localStorage al iniciar
   * Útil para persistencia entre recargas de página
   */
  cargarModulosDesdeStorage(): void {
    const modulos = this.getModulosFromStorage();
    if (modulos.length > 0) {
      this.modulosSubject.next(modulos);
    }
  }

  // ========================================================================
  // MÉTODOS PARA ADMINISTRADORES (opcional, para futuras funcionalidades)
  // ========================================================================

  /**
   * Obtiene todos los módulos (solo para administradores)
   */
  getTodosModulos(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/modulos`);
  }

  /**
   * Obtiene la matriz completa de permisos (solo para administradores)
   */
  getMatrizPermisos(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/modulos/matriz-permisos`);
  }

  /**
   * Asigna o actualiza permisos de un módulo a un rol (solo admin)
   */
  asignarPermisos(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/modulos/asignar-rol`, data);
  }
}
