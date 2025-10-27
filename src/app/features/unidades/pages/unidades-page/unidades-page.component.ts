import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { UnidadFilters, UnidadFuncional, UnidadesStats } from '../../models/unidad.model';
import { UnidadFiltersComponent } from '../../components/unidad-filters/unidad-filters.component';
import { UnidadCardComponent } from '../../components/unidad-card/unidad-card.component';

// Interfaz temporal para consorcios
interface Consorcio {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-unidades-page',
  standalone: true,
  imports: [
    CommonModule,
    UnidadFiltersComponent,
    UnidadCardComponent
  ],
  templateUrl: './unidades-page.component.html'
})
export class UnidadesPageComponent implements OnInit {
  
  unidades: UnidadFuncional[] = [];
  consorcios: Consorcio[] = [];
  loading = false;
  error: string | null = null;

  // Paginación
  currentPage = 1;
  pageSize = 12;
  total = 0;
  totalPages = 0;

  // Hacer Math disponible en el template
  Math = Math;

  // Filtros
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsorcios();
    this.loadUnidades();
  }

  loadConsorcios(): void {
    // TODO: Implementar llamada al servicio de consorcios
    // Por ahora array vacío
    this.consorcios = [];
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

  onFiltersChange(newFilters: UnidadFilters): void {
    this.filters = { ...newFilters };
    this.currentPage = 1;
    this.loadUnidades();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUnidades();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onViewUnidad(unidad: UnidadFuncional): void {
    this.router.navigate(['/unidades', unidad.id]);
  }

  onEditUnidad(unidad: UnidadFuncional): void {
    this.router.navigate(['/unidades', unidad.id, 'editar']);
  }

  onDeleteUnidad(unidad: UnidadFuncional): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar la unidad ${unidad.codigo}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmacion) {
      this.unidadesService.deleteUnidad(unidad.id).subscribe({
        next: () => {
          alert('Unidad eliminada correctamente');
          this.loadUnidades();
        },
        error: (err) => {
          console.error('Error al eliminar unidad:', err);
          alert('Error al eliminar la unidad. Por favor, intente nuevamente.');
        }
      });
    }
  }

  onCreateUnidad(): void {
    this.router.navigate(['/unidades', 'nuevo']);
  }

  getEstadisticas(): UnidadesStats {
    const ocupadas = this.unidades.filter(u => u.estado === 'ocupado').length;
    const vacantes = this.unidades.filter(u => u.estado === 'vacante').length;
    const mantenimiento = this.unidades.filter(u => u.estado === 'mantenimiento').length;
    const conTickets = this.unidades.filter(u => (u.tickets_count || 0) > 0).length;

    return { ocupadas, vacantes, mantenimiento, conTickets, total: this.total };
  }
}