import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../auth.service';

@Component({
  selector: 'app-pendiente-aprobacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pendiente-aprobacion.component.html',
  styleUrls: ['./pendiente-aprobacion.component.scss']
})
export class PendienteAprobacionComponent implements OnInit {
  currentUser: User | null = null;
  emailSoporte = 'admin@consorcios.com';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Si el usuario ya está aprobado, redirigir al dashboard
    if (this.authService.canAccessApp()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtener nombre completo del usuario
   */
  getFullName(): string {
    if (!this.currentUser) return 'Usuario';
    const nombre = this.currentUser.nombre || '';
    const apellido = this.currentUser.apellido || '';
    return `${nombre} ${apellido}`.trim() || 'Usuario';
  }

  /**
   * Obtener estado del usuario
   */
  getUserStatus(): string {
    if (!this.currentUser) return 'Pendiente';

    const aprobado = this.currentUser.aprobado !== false;
    const activo = this.currentUser.activo !== false;

    if (!aprobado) return 'Pendiente de aprobación';
    if (!activo) return 'Cuenta inactiva';

    return 'Activo';
  }

  /**
   * Obtener mensaje según el estado
   */
  getStatusMessage(): string {
    if (!this.currentUser) {
      return 'Tu cuenta está siendo revisada por un administrador.';
    }

    const aprobado = this.currentUser.aprobado !== false;
    const activo = this.currentUser.activo !== false;

    if (!aprobado) {
      return 'Tu cuenta ha sido creada exitosamente, pero requiere aprobación de un administrador antes de poder acceder al sistema.';
    }

    if (!activo) {
      return 'Tu cuenta ha sido desactivada. Por favor, contacta al administrador del sistema.';
    }

    return 'Tu cuenta está activa y aprobada.';
  }

  /**
   * Obtener icono según el estado
   */
  getStatusIcon(): string {
    if (!this.currentUser) return '⏳';

    const aprobado = this.currentUser.aprobado !== false;
    const activo = this.currentUser.activo !== false;

    if (!aprobado) return '⏳';
    if (!activo) return '🔒';

    return '✅';
  }

  /**
   * Copiar email de soporte al portapapeles
   */
  copyEmailToClipboard(): void {
    navigator.clipboard.writeText(this.emailSoporte).then(() => {
      alert('Email copiado al portapapeles');
    });
  }
}
