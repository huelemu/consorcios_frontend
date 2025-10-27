import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnidadesService } from '../../services/unidades.service';
import { 
  UnidadFuncional, 
  UnidadFilters,
  ESTADO_UNIDAD_LABELS,
  ESTADO_UNIDAD_COLORS,
  ESTADO_UNIDAD_ICONS,
  EstadoUnidad
} from '../../models/unidad.model';

/**
 * =========================================
 * UNIDADES LIST COMPONENT
 * =========================================
 * Componente para listar y gestionar unidades funcionales
 */
@Component({
  selector: 'app-unidades-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './unidades-list.component.html',
  styleUrls: ['./unidades-list.component.scss']
})
export class UnidadesListComponent implements OnInit {
  unidades: UnidadFuncional[] = [];
  filteredUnidades: UnidadFuncional[] = [];
  loading = false;
  error: string | null = null;
  
  // Filtros
  filters: UnidadFilters = {
    search: '',
    estado: undefined,
    piso: undefined,
    sortBy: 'codigo',
    sortOrder: 'ASC'
  };

  // Paginación
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;

  // UI helpers
  estadoLabels = ESTADO_UNIDAD_LABELS;
  estadoColors = ESTADO_UNIDAD_COLORS;
  estadoIcons = ESTADO_UNIDAD_ICONS;

  // Para el modal de confirmación de eliminación
  showDeleteModal = false;
  unidadToDelete: UnidadFuncional | null = null;

  constructor(
    private unidadesService: UnidadesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUnidades();
  }

  /**
   * Cargar todas las unidades
   */
  loadUnidades(): void {
    this.loading = true;
    this.error = null;

    this.unidadesService.getUnidades(this.filters).subscribe({
      next: (response) => {
        // El backend puede devolver array directo o paginado
        if (Array.isArray(response)) {
          this.unidades = response;
          this.applyLocalFilters();
        } else {
         this.unidades = (response as any).unidades;
          this.totalPages = (response as any).totalPages;
          this.filteredUnidades = this.unidades;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar unidades:', err);
        this.error = 'Error al cargar las unidades. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Aplicar filtros locales (búsqueda y estado)
   */
  applyLocalFilters(): void {
    let result = [...this.unidades];

    // Filtro de búsqueda
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      result = result.filter(u =>
        u.codigo.toLowerCase().includes(search) ||
        u.piso.toLowerCase().includes(search) ||
        u.consorcio?.nombre.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (this.filters.estado) {
      result = result.filter(u => u.estado === this.filters.estado);
    }

    // Filtro por piso
    if (this.filters.piso) {
      result = result.filter(u => u.piso === this.filters.piso);
    }

    // Ordenamiento
    result = this.sortUnidades(result);

    // Paginación local
    this.totalPages = Math.ceil(result.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUnidades = result.slice(startIndex, startIndex + this.pageSize);
  }

  /**
   * Ordenar unidades según criterio seleccionado
   */
  sortUnidades(unidades: UnidadFuncional[]): UnidadFuncional[] {
    return unidades.sort((a, b) => {
      let comparison = 0;

      switch (this.filters.sortBy) {
        case 'codigo':
          comparison = a.codigo.localeCompare(b.codigo);
          break;
        case 'piso':
          comparison = a.piso.localeCompare(b.piso);
          break;
        case 'superficie':
          comparison = a.superficie - b.superficie;
          break;
        default:
          comparison = 0;
      }

      return this.filters.sortOrder === 'ASC' ? comparison : -comparison;
    });
  }

  /**
   * Manejar cambio en búsqueda
   */
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyLocalFilters();
  }

  /**
   * Manejar cambio en filtro de estado
   */
  onEstadoChange(): void {
    this.currentPage = 1;
    this.applyLocalFilters();
  }

  /**
   * Manejar cambio en ordenamiento
   */
  onSortChange(): void {
    this.applyLocalFilters();
  }

  /**
   * Navegar a crear nueva unidad
   */
  crearUnidad(): void {
    this.router.navigate(['/unidades/nuevo']);
  }

  /**
   * Navegar a ver detalle de unidad
   */
  verDetalle(id: number): void {
    this.router.navigate(['/unidades', id]);
  }

  /**
   * Navegar a editar unidad
   */
  editarUnidad(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/unidades/editar', id]);
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  confirmarEliminar(unidad: UnidadFuncional, event: Event): void {
    event.stopPropagation();
    this.unidadToDelete = unidad;
    this.showDeleteModal = true;
  }

  /**
   * Cancelar eliminación
   */
  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.unidadToDelete = null;
  }

  /**
   * Eliminar unidad
   */
  eliminarUnidad(): void {
    if (!this.unidadToDelete) return;

    this.unidadesService.deleteUnidad(this.unidadToDelete.id).subscribe({
      next: () => {
        this.unidades = this.unidades.filter(u => u.id !== this.unidadToDelete!.id);
        this.applyLocalFilters();
        this.showDeleteModal = false;
        this.unidadToDelete = null;
      },
      error: (err) => {
        console.error('Error al eliminar unidad:', err);
        this.error = 'Error al eliminar la unidad. Por favor, intenta nuevamente.';
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filters = {
      search: '',
      estado: undefined,
      piso: undefined,
      sortBy: 'codigo',
      sortOrder: 'ASC'
    };
    this.currentPage = 1;
    this.applyLocalFilters();
  }

  /**
   * Cambiar página
   */
  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyLocalFilters();
    }
  }

  /**
   * Obtener clase CSS para badge de estado
   */
  getEstadoClass(estado: EstadoUnidad): string {
    return this.estadoColors[estado];
  }

  /**
   * Obtener label para estado
   */
  getEstadoLabel(estado: EstadoUnidad): string {
    return this.estadoLabels[estado];
  }

  /**
   * Obtener icono para estado
   */
  getEstadoIcon(estado: EstadoUnidad): string {
    return this.estadoIcons[estado];
  }

  /**
   * Generar array de páginas para paginación
   */
  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}