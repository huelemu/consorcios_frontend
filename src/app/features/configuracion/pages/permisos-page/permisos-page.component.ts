import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { Usuario, ROL_LABELS, ROL_COLORS, RolGlobal } from '../../../usuarios/models/usuario.model';
import { ToastService } from '../../../../core/toast/toast.service';
import { NotificationsService } from '../../../../core/services/notifications.service';

@Component({
  selector: 'app-permisos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permisos-page.component.html',
  styleUrls: ['./permisos-page.component.scss']
})
export class PermisosPageComponent implements OnInit {
  usuariosPendientes: Usuario[] = [];
  todosUsuarios: Usuario[] = [];
  loading = false;
  selectedTab: 'pendientes' | 'todos' = 'pendientes';

  // Para el modal de cambio de rol
  showRoleModal = false;
  selectedUsuario: Usuario | null = null;
  nuevoRol: RolGlobal | null = null;

  // Constantes para UI
  ROL_LABELS = ROL_LABELS;
  ROL_COLORS = ROL_COLORS;
  roles: RolGlobal[] = [
    'admin_global',
    'tenant_admin',
    'admin_consorcio',
    'admin_edificio',
    'propietario',
    'inquilino',
    'proveedor'
  ];

  constructor(
    private usuariosService: UsuariosService,
    private toastService: ToastService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos iniciales
   */
  cargarDatos(): void {
    this.cargarUsuariosPendientes();
    this.cargarTodosUsuarios();
  }

  /**
   * Cargar usuarios pendientes de aprobación
   */
  cargarUsuariosPendientes(): void {
    this.loading = true;
    this.usuariosService.getUsuariosPendientes().subscribe({
      next: (usuarios) => {
        this.usuariosPendientes = usuarios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios pendientes:', error);
        this.toastService.error('Error al cargar usuarios pendientes');
        this.loading = false;
      }
    });
  }

  /**
   * Cargar todos los usuarios
   */
  cargarTodosUsuarios(): void {
    this.usuariosService.getUsuarios({ limit: 100 }).subscribe({
      next: (response) => {
        this.todosUsuarios = response.usuarios;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  /**
   * Aprobar un usuario
   */
  aprobarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Estás seguro de aprobar a ${usuario.email}?`)) {
      return;
    }

    this.loading = true;
    this.usuariosService.aprobarUsuario(usuario.id).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${usuario.email} aprobado exitosamente`);
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error aprobando usuario:', error);
        this.toastService.error('Error al aprobar usuario');
        this.loading = false;
      }
    });
  }

  /**
   * Rechazar un usuario
   */
  rechazarUsuario(usuario: Usuario): void {
    const motivo = prompt(`¿Por qué rechazas a ${usuario.email}?`);
    if (motivo === null) return; // Canceló

    this.loading = true;
    this.usuariosService.rechazarUsuario(usuario.id, motivo).subscribe({
      next: () => {
        this.toastService.info(`Usuario ${usuario.email} rechazado`);
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error rechazando usuario:', error);
        this.toastService.error('Error al rechazar usuario');
        this.loading = false;
      }
    });
  }

  /**
   * Abrir modal para cambiar rol
   */
  abrirModalCambiarRol(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.nuevoRol = usuario.rol_global;
    this.showRoleModal = true;
  }

  /**
   * Cerrar modal de cambio de rol
   */
  cerrarModalRol(): void {
    this.showRoleModal = false;
    this.selectedUsuario = null;
    this.nuevoRol = null;
  }

  /**
   * Confirmar cambio de rol
   */
  confirmarCambioRol(): void {
    if (!this.selectedUsuario || !this.nuevoRol) return;

    this.loading = true;
    this.usuariosService.cambiarRolGlobal(this.selectedUsuario.id, this.nuevoRol).subscribe({
      next: () => {
        this.toastService.success('Rol actualizado exitosamente');
        this.notificationsService.notifyRoleChanged(this.ROL_LABELS[this.nuevoRol!]);
        this.cerrarModalRol();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error cambiando rol:', error);
        this.toastService.error('Error al cambiar rol');
        this.loading = false;
      }
    });
  }

  /**
   * Activar/Desactivar usuario
   */
  toggleUsuarioActivo(usuario: Usuario): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${accion} a ${usuario.email}?`)) {
      return;
    }

    this.loading = true;
    const operacion = usuario.activo
      ? this.usuariosService.desactivarUsuario(usuario.id)
      : this.usuariosService.activarUsuario(usuario.id);

    operacion.subscribe({
      next: () => {
        this.toastService.success(`Usuario ${accion}do exitosamente`);
        this.cargarDatos();
      },
      error: (error) => {
        console.error(`Error al ${accion} usuario:`, error);
        this.toastService.error(`Error al ${accion} usuario`);
        this.loading = false;
      }
    });
  }

  /**
   * Obtener nombre completo del usuario
   */
  getNombreCompleto(usuario: Usuario): string {
    if (usuario.persona) {
      return `${usuario.persona.nombre} ${usuario.persona.apellido}`.trim();
    }
    return usuario.email;
  }

  /**
   * Cambiar pestaña activa
   */
  cambiarTab(tab: 'pendientes' | 'todos'): void {
    this.selectedTab = tab;
  }
}
