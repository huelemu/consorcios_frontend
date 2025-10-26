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

/**
 * =========================================
 * USUARIOS PAGE COMPONENT
 * =========================================
 * Página principal para gestión de usuarios
 */
@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsuariosListComponent,
    UsuariosCardsComponent,
    UsuarioFormModalComponent
  ],
  templateUrl: './usuarios-page.component.html',
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .bg-white {
      animation: fadeIn 0.3s ease-out;
    }
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    button:not(:disabled):hover {
      transform: translateY(-1px);
    }
    button:not(:disabled):active {
      transform: translateY(0);
    }
    input[type="text"]:focus, input[type="email"]:focus, select:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    .bg-white:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    button.bg-blue-600 {
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    }
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    button:focus-visible, input:focus-visible, select:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `]
})
export class UsuariosPageComponent implements OnInit {
  // Estado
  usuarios: Usuario[] = [];
  personasDisponibles: any[] = [];
  loading = false;
  error: string | null = null;

  // Vista activa (list o cards)
  activeView: 'list' | 'cards' = 'list';

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
  selectedUsuario: Usuario | null = null;

  // Roles disponibles para el filtro
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
    private personasService: PersonasService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadPersonasDisponibles();
  }

  // ========================================
  // CARGA DE DATOS
  // ========================================

  /**
   * Cargar usuarios con filtros
   */
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
        this.error = 'Error al cargar los usuarios. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Cargar personas disponibles (sin usuario asignado)
   */
  loadPersonasDisponibles(): void {
    this.usuariosService.getPersonasSinUsuario().subscribe({
      next: (personas) => {
        this.personasDisponibles = personas;
      },
      error: (err) => {
        // Si el endpoint no existe (404), no es crítico
        // Solo logueamos y continuamos sin personas disponibles
        console.warn('Endpoint de personas disponibles no encontrado (esto es opcional):', err);
        this.personasDisponibles = []; // Array vacío para evitar errores
      }
    });
  }

  // ========================================
  // FILTROS Y BÚSQUEDA
  // ========================================

  /**
   * Aplicar filtros
   */
  applyFilters(): void {
    this.filters.page = 1; // Reset a la primera página
    this.loadUsuarios();
  }

  /**
   * Limpiar filtros
   */
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

  /**
   * Cambiar ordenamiento
   */
  changeSort(field: 'fecha_creacion' | 'email' | 'username'): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.loadUsuarios();
  }

  // ========================================
  // PAGINACIÓN
  // ========================================

  /**
   * Cambiar página
   */
  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.filters.page = newPage;
    this.page = newPage;
    this.loadUsuarios();
  }

  /**
   * Cambiar límite de resultados
   */
  changeLimit(newLimit: number): void {
    this.limit = newLimit;
    this.filters.limit = newLimit;
    this.filters.page = 1;
    this.loadUsuarios();
  }

  // ========================================
  // MODAL
  // ========================================

  /**
   * Abrir modal para crear
   */
  openCreateModal(): void {
    this.selectedUsuario = null;
    this.isModalOpen = true;
  }

  /**
   * Abrir modal para editar
   */
  openEditModal(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.isModalOpen = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUsuario = null;
  }

  /**
   * Guardar usuario (crear o editar)
   */
  onSaveUsuario(data: CreateUsuarioDto | UpdateUsuarioDto): void {
    if (this.selectedUsuario) {
      // Editar
      this.updateUsuario(this.selectedUsuario.id, data as UpdateUsuarioDto);
    } else {
      // Crear
      this.createUsuario(data as CreateUsuarioDto);
    }
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * Crear usuario
   */
  private createUsuario(data: CreateUsuarioDto): void {
    this.usuariosService.createUsuario(data).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsuarios();
        this.loadPersonasDisponibles();
        this.showSuccessMessage('Usuario creado exitosamente');
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.showErrorMessage('Error al crear el usuario');
      }
    });
  }

  /**
   * Actualizar usuario
   */
  private updateUsuario(id: number, data: UpdateUsuarioDto): void {
    this.usuariosService.updateUsuario(id, data).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsuarios();
        this.showSuccessMessage('Usuario actualizado exitosamente');
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.showErrorMessage('Error al actualizar el usuario');
      }
    });
  }

  /**
   * Eliminar usuario
   */
  onDeleteUsuario(id: number): void {
    this.usuariosService.deleteUsuario(id).subscribe({
      next: () => {
        this.loadUsuarios();
        this.showSuccessMessage('Usuario eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.showErrorMessage('Error al eliminar el usuario');
      }
    });
  }

  /**
   * Toggle estado activo/inactivo
   */
  onToggleActive(usuario: Usuario): void {
    const action = usuario.activo ? 'desactivarUsuario' : 'activarUsuario';
    
    this.usuariosService[action](usuario.id).subscribe({
      next: () => {
        this.loadUsuarios();
        const message = usuario.activo ? 'Usuario desactivado' : 'Usuario activado';
        this.showSuccessMessage(message);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.showErrorMessage('Error al cambiar el estado del usuario');
      }
    });
  }

  /**
   * Reset password
   */
  onResetPassword(usuario: Usuario): void {
    this.usuariosService.resetearPassword(usuario.id).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message || 'Email de reset enviado exitosamente');
      },
      error: (err) => {
        console.error('Error al resetear password:', err);
        this.showErrorMessage('Error al enviar email de reset');
      }
    });
  }

  /**
   * Ver roles específicos
   */
  onViewRoles(usuario: Usuario): void {
    // TODO: Implementar modal para ver/editar roles específicos
    console.log('Ver roles de:', usuario);
    alert('Funcionalidad de roles específicos en desarrollo');
  }

  // ========================================
  // CAMBIO DE VISTA
  // ========================================

  /**
   * Cambiar vista (list/cards)
   */
  setView(view: 'list' | 'cards'): void {
    this.activeView = view;
  }

  // ========================================
  // MENSAJES
  // ========================================

  private showSuccessMessage(message: string): void {
    // TODO: Implementar toast/notification service
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // TODO: Implementar toast/notification service
    alert(message);
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Obtener rango de páginas para la paginación
   */
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

  /**
   * Verificar si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.rol_global ||
      this.filters.activo !== undefined
    );
  }

  /**
   * Contar usuarios activos
   */
  getActivosCount(): number {
    return this.usuarios?.filter(u => u.activo).length || 0;
  }

  /**
   * Contar usuarios inactivos
   */
  getInactivosCount(): number {
    return this.usuarios?.filter(u => !u.activo).length || 0;
  }

  /**
   * Obtener máximo de resultados para paginación
   */
  getMaxResult(): number {
    return Math.min(this.page * this.limit, this.total);
  }
}