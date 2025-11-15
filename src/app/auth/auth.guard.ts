import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModulosService } from '../core/services/modulos.service';

/**
 * Guard de autenticación
 * Verifica que el usuario esté logueado, aprobado y activo
 * También carga los módulos del usuario desde localStorage si no están cargados
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modulosService = inject(ModulosService);

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

  // Cargar módulos desde localStorage si aún no están cargados
  // Esto asegura que los módulos estén disponibles incluso después de recargar la página
  const modulosActuales = modulosService.getModulosActuales();
  if (modulosActuales.length === 0) {
    modulosService.cargarModulosDesdeStorage();
  }

  return true;
};