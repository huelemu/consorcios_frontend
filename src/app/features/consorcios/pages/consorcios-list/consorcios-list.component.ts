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

  // Vista: 'cards' o 'list'
  viewMode: 'cards' | 'list' = 'cards';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filtros
  filters: ConsorcioFilters = {
    search: '',
    estado: undefined,
    ciudad: '',
    provincia: '',
    sortBy: 'nombre',
    sortOrder: 'asc'
  };

  // UI
  showFilters: boolean = true;
  selectedConsorcio: Consorcio | null = null;
  showDeleteModal: boolean = false;

  // Permisos
  canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;

  // Constantes
  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_COLORS = ESTADO_COLORS;
  readonly PROVINCIAS = PROVINCIAS_ARGENTINA;
  readonly Math = Math;
  
  constructor(
    private consorciosService: ConsorciosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadConsorcios();
  }

  checkPermissions(): void {
    this.canCreate = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
    this.canEdit = this.authService.hasAnyRole(['admin_global', 'tenant_admin', 'admin_consorcio']);
    this.canDelete = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
  }

  loadConsorcios(): void {
    this.loading = true;
    this.error = '';

    const params: ConsorcioFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    };

    if (!params.search) delete params.search;
    if (!params.estado) delete params.estado;
    if (!params.ciudad) delete params.ciudad;
    if (!params.provincia) delete params.provincia;

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

  applyFilters(): void {
    this.currentPage = 1;
    this.loadConsorcios();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      estado: undefined,
      ciudad: '',
      provincia: '',
      sortBy: 'nombre',
      sortOrder: 'asc'
    };
    this.currentPage = 1;
    this.loadConsorcios();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.estado ||
      this.filters.ciudad ||
      this.filters.provincia
    );
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadConsorcios();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadConsorcios();
  }

  sortBy(field: 'nombre' | 'ciudad' | 'creado_en'): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  crearConsorcio(): void {
    this.router.navigate(['/consorcios/nuevo']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/consorcios', id]);
  }

  editarConsorcio(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/consorcios/editar', id]);
  }

  confirmarEliminar(consorcio: Consorcio, event: Event): void {
    event.stopPropagation();
    this.selectedConsorcio = consorcio;
    this.showDeleteModal = true;
  }

  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.selectedConsorcio = null;
  }

  eliminarConsorcio(): void {
    if (!this.selectedConsorcio) return;

    this.consorciosService.deleteConsorcio(this.selectedConsorcio.id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.selectedConsorcio = null;
        this.loadConsorcios();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.error = 'Error al eliminar el consorcio';
        this.showDeleteModal = false;
      }
    });
  }

  toggleEstado(consorcio: Consorcio, event: Event): void {
    event.stopPropagation();

    const action = consorcio.estado === 'activo'
      ? this.consorciosService.desactivarConsorcio(consorcio.id)
      : this.consorciosService.activarConsorcio(consorcio.id);

    action.subscribe({
      next: () => {
        this.loadConsorcios();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.error = error.error?.message || 'Error al cambiar el estado';
      }
    });
  }

  getDireccion(consorcio: Consorcio): string {
    return getDireccionCompleta(consorcio);
  }

  getResponsable(consorcio: Consorcio): string {
    return getNombreResponsable(consorcio);
  }

  getEstadisticas() {
    return {
      activos: this.consorcios.filter(c => c.estado === 'activo').length,
      inactivos: this.consorcios.filter(c => c.estado === 'inactivo').length,
      totalUnidades: this.consorcios.reduce((sum, c) => sum + (c.stats?.totalUnidades || 0), 0)
    };
  }

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

  canEditConsorcio(consorcio: Consorcio): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    if (user.rol === 'admin_global') return true;
    if (user.rol === 'tenant_admin' && consorcio.tenant_id === user.id) return true;
    if (user.rol === 'admin_consorcio' && consorcio.responsable_id === user.id) return true;

    return false;
  }

  canDeleteConsorcio(consorcio: Consorcio): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    if (user.rol === 'admin_global') return true;
    if (user.rol === 'tenant_admin' && consorcio.tenant_id === user.id) return true;

    return false;
  }
}