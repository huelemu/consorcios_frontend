import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import { AuthService } from '../../../../auth/auth.service';
import { UnidadFilters, UnidadFuncional, UnidadesStats } from '../../models/unidad.model';
import { Consorcio } from '../../../consorcios/models/consorcio.model';
import { UnidadFiltersComponent } from '../../components/unidad-filters/unidad-filters.component';
import { UnidadCardComponent } from '../../components/unidad-card/unidad-card.component';
import { UnidadListComponent } from '../../components/unidad-list/unidad-list.component';
import { UnidadFormComponent } from '../../components/unidad-form/unidad-form.component';
import { MatDialog } from '@angular/material/dialog';
import { TicketFormComponent } from '../../../tickets/components/ticket-form/ticket-form.component';

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
  stats: UnidadesStats = {
    total: 0,
    ocupadas: 0,
    vacantes: 0,
    mantenimiento: 0,
    conTickets: 0
  };
  loading = false;
  loadingConsorcios = false;
  loadingStats = false;
  error: string | null = null;
  statsError: string | null = null;

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
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Cargar filtros desde URL de forma síncrona ANTES de cargar datos
    this.loadFiltersFromUrl();
    this.loadConsorcios();
    this.loadUnidades();
    this.loadStats();
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

  private loadFiltersFromUrl(): void {
    // Leer parámetros de URL de forma síncrona
    const params = this.route.snapshot.queryParams;

    if (params['consorcio_id']) {
      this.filters.consorcio_id = +params['consorcio_id'];
    }

    // También suscribirse para cambios futuros en la URL
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['consorcio_id'] && +queryParams['consorcio_id'] !== this.filters.consorcio_id) {
        this.filters.consorcio_id = +queryParams['consorcio_id'];
        this.currentPage = 1;
        this.loadUnidades();
        this.loadStats();
      }
    });
  }

  loadStats(): void {
    this.loadingStats = true;
    this.statsError = null;

    this.unidadesService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.statsError = 'No se pudieron cargar las estadísticas';
        // Mantener las estadísticas en 0 en caso de error
        this.stats = {
          total: 0,
          ocupadas: 0,
          vacantes: 0,
          mantenimiento: 0,
          conTickets: 0
        };
        this.loadingStats = false;
      }
    });
  }

  onFiltersChange(newFilters: UnidadFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.loadUnidades();
    // Recargar estadísticas cuando cambian los filtros
    this.loadStats();
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

  onViewUnidad(unidad: UnidadFuncional | any): void {
    this.router.navigate(['/unidades', unidad.id]);
  }

  onEditUnidad(unidad: UnidadFuncional | any): void {
    // Usar modal
    this.editingUnidad = unidad as UnidadFuncional;
    this.showFormModal = true;
  }

  onDeleteUnidad(unidad: UnidadFuncional | any): void {
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
    this.loadStats();
  }

  /**
   * Crear ticket para una unidad
   */
  onCreateTicket(unidad: UnidadFuncional | any): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      alert('Debes iniciar sesión para crear un ticket.');
      return;
    }

    const dialogData = {
      userId: currentUser.id,
      consorcioId: unidad.consorcio_id,
      consorcioNombre: unidad.consorcio?.nombre,
      unidadId: unidad.id,
      unidadNombre: `${unidad.codigo} - Piso ${unidad.piso}`
    };

    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((ticket) => {
      if (ticket) {
        console.log('✅ Ticket creado:', ticket);
        this.loadUnidades();
        this.loadStats();
      }
    });
  }
}