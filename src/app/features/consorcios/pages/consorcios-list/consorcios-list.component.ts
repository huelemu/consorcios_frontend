import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsorciosService } from '../../services/consorcios.service';
import { AuthService } from '../../../../auth/auth.service';
import {
  Consorcio,
  ConsorcioFilters,
  ESTADO_LABELS,
  ESTADO_COLORS,
  PROVINCIAS_ARGENTINA,
  getDireccionCompleta,
  getNombreResponsable
} from '../../models/consorcio.model';

/**
 * =========================================
 * CONSORCIOS LIST COMPONENT
 * =========================================
 * Página principal del módulo de consorcios
 */
@Component({
  selector: 'app-consorcios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consorcios-list.component.html',
  styleUrls: ['./consorcios-list.component.scss']
})
export class ConsorciosListComponent implements OnInit {
  // Data
  consorcios: Consorcio[] = [];
  loading: boolean = false;
  error: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // ✨ Estadísticas globales (totales de toda la BD, sin filtros)
  totalConsorcios: number = 0;
  totalUnidades: number = 0;
  totalConsorciosActivos: number = 0;
  totalConsorciosInactivos: number = 0;

  // Filtros
  filters: ConsorcioFilters = {
    search: '',
    codigo_ext: '',
    estado: undefined,
    ciudad: '',
    provincia: '',
    conTicketsPendientes: false,
    sortBy: 'nombre',
    sortOrder: 'asc'
  };

  // UI
  showFilters: boolean = false;
  selectedConsorcio: Consorcio | null = null;
  showDeleteModal: boolean = false;
  viewMode: 'list' | 'cards' = 'list'; // ✨ Vista de lista o tarjetas

  // Permisos
  canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;

  // Constantes para el template
  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_COLORS = ESTADO_COLORS;
  readonly PROVINCIAS = PROVINCIAS_ARGENTINA;
  readonly Math = Math; // Exponer Math para usar en el template

  constructor(
    private consorciosService: ConsorciosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadEstadisticasGenerales(); // ✨ Cargar estadísticas primero
    this.loadConsorcios();
  }

  /**
   * Verificar permisos del usuario
   */
  checkPermissions(): void {
    this.canCreate = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
    this.canEdit = this.authService.hasAnyRole(['admin_global', 'tenant_admin', 'admin_consorcio']);
    this.canDelete = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
  }

  /**
   * ✨ Cargar estadísticas generales (sin filtros)
   */
  loadEstadisticasGenerales(): void {
    this.consorciosService.getGeneralStats().subscribe({
      next: (stats) => {
        this.totalConsorcios = stats.consorcios.total;
        this.totalConsorciosActivos = stats.consorcios.activos;
        this.totalConsorciosInactivos = stats.consorcios.inactivos;
        this.totalUnidades = stats.totalUnidades;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        // No mostrar error al usuario, solo log
      }
    });
  }

  /**
   * Cargar consorcios con filtros aplicados
   */
  loadConsorcios(): void {
    this.loading = true;
    this.error = '';

    const params: ConsorcioFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    };

    // Limpiar filtros vacíos
    if (!params.search) delete params.search;
    if (!params.codigo_ext) delete params.codigo_ext;
    if (!params.estado) delete params.estado;
    if (!params.ciudad) delete params.ciudad;
    if (!params.provincia) delete params.provincia;
    if (!params.conTicketsPendientes) delete params.conTicketsPendientes;

    this.consorciosService.getConsorcios(params).subscribe({
      next: (response) => {
        this.consorcios = response.data;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar consorcios:', error);
        this.error = 'Error al cargar los consorcios. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Aplicar filtros y resetear paginación
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadConsorcios();
  }

  /**
   * Limpiar todos los filtros
   */
  clearFilters(): void {
    this.filters = {
      search: '',
      codigo_ext: '',
      estado: undefined,
      ciudad: '',
      provincia: '',
      conTicketsPendientes: false,
      sortBy: 'nombre',
      sortOrder: 'asc'
    };
    this.currentPage = 1;
    this.loadConsorcios();
  }

  /**
   * Toggle mostrar/ocultar filtros
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Cambiar página
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadConsorcios();
    }
  }

  /**
   * Cambiar tamaño de página
   */
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadConsorcios();
  }

  /**
   * Ordenar por columna
   */
  sortBy(field: 'nombre' | 'ciudad' | 'creado_en'): void {
    if (this.filters.sortBy === field) {
      // Toggle orden
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.loadConsorcios();
  }

  /**
   * Navegar al detalle de un consorcio
   */
  verDetalle(id: number): void {
    this.router.navigate(['/consorcios', id]);
  }

  /**
   * Navegar al formulario de crear consorcio
   */
  crearConsorcio(): void {
    this.router.navigate(['/consorcios/nuevo']);
  }

  /**
   * Navegar al formulario de editar consorcio
   */
  editarConsorcio(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/consorcios', id, 'editar']);
  }

  /**
   * Navegar al formulario de crear ticket para un consorcio
   */
  crearTicket(consorcio: Consorcio, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/tickets/nuevo'], {
      queryParams: { consorcioId: consorcio.id }
    });
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  confirmarEliminar(consorcio: Consorcio, event: Event): void {
    event.stopPropagation();
    this.selectedConsorcio = consorcio;
    this.showDeleteModal = true;
  }

  /**
   * Eliminar consorcio
   */
  eliminarConsorcio(): void {
    if (!this.selectedConsorcio) return;

    this.loading = true;
    this.consorciosService.deleteConsorcio(this.selectedConsorcio.id).subscribe({
      next: (response) => {
        console.log('Consorcio eliminado:', response.message);
        this.showDeleteModal = false;
        this.selectedConsorcio = null;
        this.loadEstadisticasGenerales(); // ✨ Recargar estadísticas
        this.loadConsorcios();
      },
      error: (error) => {
        console.error('Error al eliminar consorcio:', error);
        this.error = error.error?.message || 'Error al eliminar el consorcio';
        this.loading = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Cancelar eliminación
   */
  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.selectedConsorcio = null;
  }

  /**
   * Cambiar estado del consorcio (activar/desactivar)
   */
  toggleEstado(consorcio: Consorcio, event: Event): void {
    event.stopPropagation();

    const action = consorcio.estado === 'activo' 
      ? this.consorciosService.desactivarConsorcio(consorcio.id)
      : this.consorciosService.activarConsorcio(consorcio.id);

    action.subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response.message);
        this.loadEstadisticasGenerales(); // ✨ Recargar estadísticas
        this.loadConsorcios();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.error = error.error?.message || 'Error al cambiar el estado';
      }
    });
  }

  /**
   * Obtener dirección completa formateada
   */
  getDireccion(consorcio: Consorcio): string {
    return getDireccionCompleta(consorcio);
  }

  /**
   * Obtener nombre del responsable
   */
  getResponsable(consorcio: Consorcio): string {
    return getNombreResponsable(consorcio);
  }

  /**
   * Generar array de páginas para la paginación
   */
  getPagesArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Verificar si el usuario puede editar un consorcio específico
   */
  canEditConsorcio(consorcio: Consorcio): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    if (user.rol === 'admin_global') return true;
    if (user.rol === 'tenant_admin' && consorcio.tenant_id === user.id) return true;
    if (user.rol === 'admin_consorcio' && consorcio.responsable_id === user.id) return true;

    return false;
  }

  /**
   * Verificar si el usuario puede eliminar un consorcio específico
   */
  canDeleteConsorcio(consorcio: Consorcio): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    if (user.rol === 'admin_global') return true;
    if (user.rol === 'tenant_admin' && consorcio.tenant_id === user.id) return true;

    return false;
  }

  /**
   * ✨ Obtener estadísticas para las tarjetas informativas
   * Estas estadísticas son GLOBALES (no dependen de filtros o paginación)
   */
  getEstadisticas() {
    return {
      activos: this.totalConsorciosActivos,
      inactivos: this.totalConsorciosInactivos,
      totalUnidades: this.totalUnidades
    };
  }

  /**
   * ✨ Verificar si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(
      this.filters.codigo_ext ||
      this.filters.estado ||
      this.filters.ciudad ||
      this.filters.provincia ||
      this.filters.responsable_id ||
      this.filters.conTicketsPendientes
    );
  }
}