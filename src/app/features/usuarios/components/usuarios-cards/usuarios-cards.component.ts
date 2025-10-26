import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, ROL_LABELS, ROL_COLORS, ROL_ICONS, OAUTH_ICONS, OAUTH_LABELS } from '../../models/usuario.model';

/**
 * =========================================
 * USUARIOS CARDS COMPONENT
 * =========================================
 * Vista de tarjetas para listar usuarios
 */
@Component({
  selector: 'app-usuarios-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-cards.component.html',
  styles: [`
    .bg-white {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.4s ease-out;
    }
    .bg-white:hover {
      transform: translateY(-4px);
    }
    button {
      transition: all 0.2s ease-in-out;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    button:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .rounded-full {
      transition: transform 0.3s ease-in-out;
    }
    .bg-white:hover .rounded-full {
      transform: scale(1.05);
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .bg-white:nth-child(1) { animation-delay: 0.05s; }
    .bg-white:nth-child(2) { animation-delay: 0.1s; }
    .bg-white:nth-child(3) { animation-delay: 0.15s; }
    .bg-white:nth-child(4) { animation-delay: 0.2s; }
    .bg-white:nth-child(5) { animation-delay: 0.25s; }
    .bg-white:nth-child(6) { animation-delay: 0.3s; }
    .bg-white:nth-child(7) { animation-delay: 0.35s; }
    .bg-white:nth-child(8) { animation-delay: 0.4s; }
  `]
})
export class UsuariosCardsComponent {
  @Input() usuarios: Usuario[] = [];
  @Output() edit = new EventEmitter<Usuario>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggleActive = new EventEmitter<Usuario>();
  @Output() resetPassword = new EventEmitter<Usuario>();
  @Output() viewRoles = new EventEmitter<Usuario>();

  // Exponer helpers para el template
  rolLabels = ROL_LABELS;
  rolColors = ROL_COLORS;
  rolIcons = ROL_ICONS;
  oauthIcons = OAUTH_ICONS;
  oauthLabels = OAUTH_LABELS;

  /**
   * Emitir evento de edición
   */
  onEdit(usuario: Usuario): void {
    this.edit.emit(usuario);
  }

  /**
   * Emitir evento de eliminación
   */
  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.delete.emit(id);
    }
  }

  /**
   * Emitir evento de toggle activo/inactivo
   */
  onToggleActive(usuario: Usuario): void {
    const action = usuario.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que deseas ${action} este usuario?`)) {
      this.toggleActive.emit(usuario);
    }
  }

  /**
   * Emitir evento de reset de contraseña
   */
  onResetPassword(usuario: Usuario): void {
    if (confirm(`¿Enviar email de reset de contraseña a ${usuario.email}?`)) {
      this.resetPassword.emit(usuario);
    }
  }

  /**
   * Emitir evento para ver roles
   */
  onViewRoles(usuario: Usuario): void {
    this.viewRoles.emit(usuario);
  }

  /**
   * Obtener nombre completo del usuario
   */
  getNombreCompleto(usuario: Usuario): string {
    if (usuario.persona) {
      return `${usuario.persona.nombre} ${usuario.persona.apellido || ''}`.trim();
    }
    return usuario.username || usuario.email;
  }

  /**
   * Obtener iniciales del usuario
   */
  getIniciales(usuario: Usuario): string {
    const nombre = this.getNombreCompleto(usuario);
    const palabras = nombre.split(' ');
    
    if (palabras.length >= 2) {
      return `${palabras[0].charAt(0)}${palabras[1].charAt(0)}`.toUpperCase();
    }
    
    return nombre.substring(0, 2).toUpperCase();
  }

  /**
   * Obtener clase CSS del badge de estado
   */
  getEstadoBadgeClass(activo: boolean): string {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  /**
   * Obtener texto del badge de estado
   */
  getEstadoTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  /**
   * Obtener icono del estado
   */
  getEstadoIcon(activo: boolean): string {
    return activo ? '✓' : '✗';
  }

  /**
   * Obtener clase del gradiente del avatar
   */
  getAvatarGradient(index: number): string {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-purple-500 to-pink-600'
    ];
    return gradients[index % gradients.length];
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}