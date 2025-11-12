import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { PersonasService } from '../../../personas/services/personas.service';
import {
  Usuario,
  UsuarioFilters,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  RolGlobal,
  ROL_LABELS
} from '../../models/usuario.model';
import { UsuariosListComponent } from '../../components/usuarios-list/usuarios-list.component';
import { UsuariosCardsComponent } from '../../components/usuarios-cards/usuarios-cards.component';
import { UsuarioFormModalComponent } from '../../components/usuario-form-modal/usuario-form-modal.component';
import { UsuarioRolesModalComponent } from '../../components/usuario-roles-modal/usuario-roles-modal.component';
import { ConfirmModalService } from '../../../../core/confirm-modal/confirm-modal.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsuariosListComponent,
    UsuariosCardsComponent,
    UsuarioFormModalComponent,
    UsuarioRolesModalComponent
  ],
  templateUrl: './usuarios-page.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .bg-white { animation: fadeIn 0.3s ease-out; }
  `]
})
export class UsuariosPageComponent implements OnInit {
  // Estado
  usuarios: Usuario[] = [];
  personasDisponibles: any[] = [];
  loading = false;
  error: string | null = null;

  // Vista activa y filtros colapsables
  activeView: 'list' | 'cards' = 'list';
  showFilters = true;

  // Paginación
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  // Filtros
  filters: UsuarioFilters = {
    search: '',
    rol_global: undefined,
    activo: undefined,
    page: 1,
    limit: 10,
    sortBy: 'fecha_creacion',
    sortOrder: 'desc'
  };

  // Modal
  isModalOpen = false;
  isRolesModalOpen = false;
  selectedUsuario: Usuario | null = null;

  // Roles disponibles
  rolesDisponibles: { value: RolGlobal | ''; label: string }[] = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin_global', label: ROL_LABELS.admin_global },
    { value: 'tenant_admin', label: ROL_LABELS.tenant_admin },
    { value: 'admin_consorcio', label: ROL_LABELS.admin_consorcio },
    { value: 'admin_edificio', label: ROL_LABELS.admin_edificio },
    { value: 'propietario', label: ROL_LABELS.propietario },
    { value: 'inquilino', label: ROL_LABELS.inquilino },
    { value: 'proveedor', label: ROL_LABELS.proveedor }
  ];

  constructor(
    private usuariosService: UsuariosService,
    private personasService: PersonasService,
    private confirmService: ConfirmModalService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadPersonasDisponibles();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.error = null;

    this.usuariosService.getUsuarios(this.filters).subscribe({
      next: (response) => {
        this.usuarios = response.usuarios;
        this.total = response.total;
        this.page = response.page;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'Error al cargar los usuarios.';
        this.loading = false;
      }
    });
  }

  loadPersonasDisponibles(): void {
    this.usuariosService.getPersonasSinUsuario().subscribe({
      next: (personas) => {
        this.personasDisponibles = personas;
      },
      error: (err) => {
        console.warn('Endpoint personas no disponible:', err);
        this.personasDisponibles = [];
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadUsuarios();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      rol_global: undefined,
      activo: undefined,
      page: 1,
      limit: this.limit,
      sortBy: 'fecha_creacion',
      sortOrder: 'desc'
    };
    this.loadUsuarios();
  }

  changeSort(field: 'fecha_creacion' | 'email' | 'username'): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.loadUsuarios();
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.filters.page = newPage;
    this.page = newPage;
    this.loadUsuarios();
  }

  changeLimit(newLimit: number): void {
    this.limit = newLimit;
    this.filters.limit = newLimit;
    this.filters.page = 1;
    this.loadUsuarios();
  }

  setView(view: 'list' | 'cards'): void {
    this.activeView = view;
  }

  openCreateModal(): void {
    this.selectedUsuario = null;
    this.isModalOpen = true;
  }

  openEditModal(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUsuario = null;
  }

  onSaveUsuario(data: CreateUsuarioDto | UpdateUsuarioDto): void {
    if (this.selectedUsuario) {
      this.updateUsuario(this.selectedUsuario.id, data as UpdateUsuarioDto);
    } else {
      this.createUsuario(data as CreateUsuarioDto);
    }
  }

  private createUsuario(data: CreateUsuarioDto): void {
    this.usuariosService.createUsuario(data).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsuarios();
        this.loadPersonasDisponibles();
        this.toastService.success('Usuario creado exitosamente');
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.toastService.error('Error al crear el usuario');
      }
    });
  }

  private updateUsuario(id: number, data: UpdateUsuarioDto): void {
    this.usuariosService.updateUsuario(id, data).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsuarios();
        this.toastService.success('Usuario actualizado exitosamente');
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.toastService.error('Error al actualizar el usuario');
      }
    });
  }

  async onDeleteUsuario(id: number): Promise<void> {
    const confirmed = await this.confirmService.confirmDelete(
      '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    this.usuariosService.deleteUsuario(id).subscribe({
      next: () => {
        this.loadUsuarios();
        this.toastService.success('Usuario eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.toastService.error('Error al eliminar el usuario');
      }
    });
  }

  async onToggleActive(usuario: Usuario): Promise<void> {
    const confirmed = usuario.activo
      ? await this.confirmService.confirmDeactivate(usuario.persona?.nombre || usuario.email)
      : await this.confirmService.confirmActivate(usuario.persona?.nombre || usuario.email);

    if (!confirmed) return;

    const action = usuario.activo ? 'desactivarUsuario' : 'activarUsuario';

    this.usuariosService[action](usuario.id).subscribe({
      next: () => {
        this.loadUsuarios();
        const message = usuario.activo ? 'Usuario desactivado exitosamente' : 'Usuario activado exitosamente';
        this.toastService.success(message);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.toastService.error('Error al cambiar el estado del usuario');
      }
    });
  }

  async onResetPassword(usuario: Usuario): Promise<void> {
    const confirmed = await this.confirmService.confirmResetPassword(usuario.email);

    if (!confirmed) return;

    this.usuariosService.resetearPassword(usuario.id).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Email enviado exitosamente',
          'Contraseña reseteada'
        );
      },
      error: (err) => {
        console.error('Error al resetear password:', err);
        this.toastService.error('No se pudo enviar el email de recuperación');
      }
    });
  }

  onViewRoles(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.isRolesModalOpen = true;
  }

  closeRolesModal(): void {
    this.isRolesModalOpen = false;
    this.selectedUsuario = null;
  }

  onRolesUpdated(): void {
    this.loadUsuarios();
  }

  getPageRange(): number[] {
    const range: number[] = [];
    const maxPages = 5;
    
    let start = Math.max(1, this.page - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.rol_global ||
      this.filters.activo !== undefined
    );
  }

  getActivosCount(): number {
    return this.usuarios?.filter(u => u.activo).length || 0;
  }

  getInactivosCount(): number {
    return this.usuarios?.filter(u => !u.activo).length || 0;
  }

  getMaxResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }
}