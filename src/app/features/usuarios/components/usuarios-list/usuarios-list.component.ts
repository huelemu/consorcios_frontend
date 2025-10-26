import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, ROL_LABELS, ROL_COLORS, ROL_ICONS, OAUTH_ICONS } from '../../models/usuario.model';

/**
 * =========================================
 * USUARIOS LIST COMPONENT
 * =========================================
 * Vista de tabla para listar usuarios
 */
@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-list.component.html',
  styles: [`
    tbody tr {
      transition: all 0.2s ease-in-out;
    }
    tbody tr:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    button {
      transition: all 0.2s ease-in-out;
    }
    button:hover {
      transform: scale(1.1);
    }
    button:active {
      transform: scale(0.95);
    }
  `]
})
export class UsuariosListComponent {
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
}