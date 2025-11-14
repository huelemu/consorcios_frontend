import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard de autenticación
 * Verifica que el usuario esté logueado, aprobado y activo
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está logueado
  if (!authService.isLoggedIn()) {
    // Guardar la URL que intentaba acceder para redirigir después del login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verificar si el usuario está aprobado y activo
  if (!authService.canAccessApp()) {
    // Redirigir a la pantalla de pendiente de aprobación
    router.navigate(['/pendiente-aprobacion']);
    return false;
  }

  return true;
};