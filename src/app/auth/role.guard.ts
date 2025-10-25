import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard para validar roles/permisos del usuario
 * 
 * Uso en app.routes.ts:
 * {
 *   path: 'personas',
 *   component: PersonasPageComponent,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
 * }
 */
export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  
  if (!user) {
    console.warn('🔒 RoleGuard: No hay usuario autenticado');
    router.navigate(['/login']);
    return false;
  }

  // Obtener roles permitidos de la ruta
  const allowedRoles = route.data['roles'] as string[];
  
  // Si no hay roles definidos en la ruta, permitir acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('✅ RoleGuard: No hay restricción de roles, acceso permitido');
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const userRole = user.rol;
  
  if (allowedRoles.includes(userRole)) {
    console.log(`✅ RoleGuard: Usuario con rol "${userRole}" autorizado para acceder`);
    return true;
  }

  // No tiene permisos
  console.warn(`❌ RoleGuard: Usuario con rol "${userRole}" NO autorizado. Roles requeridos: ${allowedRoles.join(', ')}`);
  router.navigate(['/dashboard']);
  return false;
};