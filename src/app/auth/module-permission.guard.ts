import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ModulosService } from '../core/services/modulos.service';
import { AuthService } from './auth.service';

/**
 * Guard para proteger rutas basándose en los permisos de módulos
 *
 * Uso en las rutas:
 * {
 *   path: 'consorcios',
 *   component: ConsorciosComponent,
 *   canActivate: [ModulePermissionGuard],
 *   data: { module: 'consorcios', action: 'ver' }
 * }
 *
 * Las acciones posibles son: 'ver', 'crear', 'editar', 'eliminar'
 */
@Injectable({ providedIn: 'root' })
export class ModulePermissionGuard implements CanActivate {
  constructor(
    private modulosService: ModulosService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener la configuración del módulo desde data
    const moduleKey = route.data['module'] as string;
    const action = (route.data['action'] as string) || 'ver'; // Por defecto: 'ver'

    // Si no se especifica módulo, permitir acceso (backward compatibility)
    if (!moduleKey) {
      console.warn('No se especificó módulo en la ruta, permitiendo acceso');
      return true;
    }

    // Verificar el permiso según la acción
    const hasPermission = this.checkPermission(moduleKey, action);

    if (!hasPermission) {
      console.warn(`Acceso denegado al módulo '${moduleKey}' con acción '${action}'`);
      // Redirigir a una página de acceso denegado o al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  /**
   * Verifica si el usuario tiene el permiso especificado
   */
  private checkPermission(moduleKey: string, action: string): boolean {
    switch (action.toLowerCase()) {
      case 'ver':
        return this.modulosService.puedeVer(moduleKey);
      case 'crear':
        return this.modulosService.puedeCrear(moduleKey);
      case 'editar':
        return this.modulosService.puedeEditar(moduleKey);
      case 'eliminar':
        return this.modulosService.puedeEliminar(moduleKey);
      default:
        console.warn(`Acción desconocida: ${action}. Use: ver, crear, editar, eliminar`);
        return false;
    }
  }
}
