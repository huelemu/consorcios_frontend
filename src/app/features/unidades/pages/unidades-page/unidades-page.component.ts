import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import { UnidadFilters, UnidadFuncional, UnidadesStats } from '../../models/unidad.model';
import { Consorcio } from '../../../consorcios/models/consorcio.model';
import { UnidadFiltersComponent } from '../../components/unidad-filters/unidad-filters.component';
import { UnidadCardComponent } from '../../components/unidad-card/unidad-card.component';
import { UnidadListComponent } from '../../components/unidad-list/unidad-list.component';
import { UnidadFormComponent } from '../../components/unidad-form/unidad-form.component';

@Component({
  selector: 'app-unidades-page',
  standalone: true,
  imports: [
    CommonModule,
    UnidadFiltersComponent,
    UnidadCardComponent,
    UnidadListComponent,
    UnidadFormComponent
  ],
  templateUrl: './unidades-page.component.html'
})
export class UnidadesPageComponent implements OnInit {
  
  unidades: UnidadFuncional[] = [];
  consorcios: Consorcio[] = [];
  loading = false;
  loadingConsorcios = false;
  error: string | null = null;

  // Vista: 'grid' o 'list'
  viewMode: 'grid' | 'list' = 'grid';
  
  // Filtros colapsables
  showFilters = true;

  // Modal form
  showFormModal = false;
  editingUnidad: UnidadFuncional | null = null;

  currentPage = 1;
  pageSize = 12;
  total = 0;
  totalPages = 0;
  Math = Math;

  filters: UnidadFilters = {
    search: '',
    consorcio_id: undefined,
    estado: '',
    tiene_tickets_pendientes: false,
    sortBy: 'codigo',
    sortOrder: 'ASC'
  };

  constructor(
    private unidadesService: UnidadesService,
    private consorciosService: ConsorciosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsorcios();
    this.loadUnidades();
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  loadConsorcios(): void {
    this.loadingConsorcios = true;
    this.consorciosService.getConsorciosActivos({ 
      limit: 100, 
      sortBy: 'nombre', 
      sortOrder: 'asc' 
    }).subscribe({
      next: (response) => {
        this.consorcios = response.data;
        this.loadingConsorcios = false;
      },
      error: (err) => {
        console.error('Error al cargar consorcios:', err);
        this.loadingConsorcios = false;
      }
    });
  }

  loadUnidades(): void {
    this.loading = true;
    this.error = null;

    const params: UnidadFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    };

    this.unidadesService.getUnidades(params).subscribe({
      next: (response) => {
        this.unidades = response.data;
        this.total = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar unidades:', err);
        this.error = 'Error al cargar las unidades. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  getEstadisticas(): UnidadesStats {
    const stats: UnidadesStats = {
      total: this.unidades.length,
      ocupadas: this.unidades.filter(u => u.estado === 'ocupado').length,
      vacantes: this.unidades.filter(u => u.estado === 'vacante').length,
      mantenimiento: this.unidades.filter(u => u.estado === 'mantenimiento').length,
      conTickets: this.unidades.filter(u => (u.tickets_count || 0) > 0).length
    };
    return stats;
  }

  onFiltersChange(newFilters: UnidadFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.loadUnidades();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUnidades();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Métodos de CRUD con modal
  onCreateUnidad(): void {
    this.editingUnidad = null;
    this.showFormModal = true;
  }

  onViewUnidad(unidad: UnidadFuncional): void {
    this.router.navigate(['/unidades', unidad.id]);
  }

  onEditUnidad(unidad: UnidadFuncional): void {
    // Usar modal
    this.editingUnidad = unidad;
    this.showFormModal = true;
  }

  onDeleteUnidad(unidad: UnidadFuncional): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la unidad ${unidad.codigo}?`)) {
      this.unidadesService.deleteUnidad(unidad.id).subscribe({
        next: () => {
          this.loadUnidades();
        },
        error: (err) => {
          console.error('Error al eliminar unidad:', err);
          alert('Error al eliminar la unidad. Por favor, intente nuevamente.');
        }
      });
    }
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingUnidad = null;
  }

  onUnidadSaved(): void {
    this.closeFormModal();
    this.loadUnidades();
  }

  // Métodos de compatibilidad
  crearUnidad(): void {
    this.onCreateUnidad();
  }

  verDetalle(unidadOrId: number | UnidadFuncional): void {
    const id = typeof unidadOrId === 'number' ? unidadOrId : unidadOrId.id;
    this.router.navigate(['/unidades', id]);
  }

  eliminarUnidad(unidadOrId: number | UnidadFuncional): void {
    const unidad = typeof unidadOrId === 'number' 
      ? this.unidades.find(u => u.id === unidadOrId)
      : unidadOrId;
    
    if (unidad) {
      this.onDeleteUnidad(unidad);
    }
  }

  refresh(): void {
    this.loadConsorcios();
    this.loadUnidades();
  }
}