import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonasListComponent } from '../../components/personas-list/personas-list';
import { PersonasCardsComponent } from '../../components/personas-cards/personas-cards';
import { PersonaFormDialogComponent } from '../../components/persona-form-dialog/persona-form-dialog';
import { PersonaFiltersComponent } from '../../components/persona-filters/persona-filters';
import { PersonasService } from '../../services/personas.service';
import { Persona, PersonasFilters, PersonasStats } from '../../models/persona.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-personas-page',
  standalone: true,
  imports: [
    CommonModule,
    PersonasListComponent,
    PersonasCardsComponent,
    PersonaFormDialogComponent,
    PersonaFiltersComponent
  ],
  templateUrl: './personas-page.component.html',
  styleUrls: ['./personas-page.component.scss']
})
export class PersonasPageComponent implements OnInit {
  // Vista activa ('list' o 'cards')
  activeView: 'list' | 'cards' = 'list';

  // Datos
  personas: Persona[] = [];
  stats: PersonasStats | null = null;

  // Estado de carga
  loading = false;
  error: string | null = null;

  // Paginación
  currentPage = 1;
  limit = 12;
  totalPages = 1;
  total = 0;

  // Filtros
  filters: PersonasFilters = {
    page: 1,
    limit: 12,
    search: '',
    tipo_persona: '',
    provincia: '',
    sortBy: 'fecha_creacion',
    sortOrder: 'DESC'
  };

  // Modal de formulario
  showFormModal = false;
  editingPersona: Persona | null = null;

  constructor(private personasService: PersonasService) {}

  ngOnInit(): void {
    this.loadPersonas();
    this.loadStats();
  }

  /**
   * Cargar personas con filtros aplicados
   */
  loadPersonas(): void {
    this.loading = true;
    this.error = null;

    this.personasService.getPersonas(this.filters).subscribe({
      next: (response) => {
        this.personas = response.data;
        this.currentPage = response.pagination.page;
        this.limit = response.pagination.limit;
        this.totalPages = response.pagination.totalPages;
        this.total = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar personas:', err);
        this.error = 'Error al cargar las personas. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Cargar estadísticas
   */
  loadStats(): void {
    this.personasService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  /**
   * Cambiar vista (lista/tarjetas)
   */
  setView(view: 'list' | 'cards'): void {
    this.activeView = view;
  }

  /**
   * Aplicar filtros
   */
  onFiltersChange(newFilters: PersonasFilters): void {
    this.filters = { ...this.filters, ...newFilters, page: 1 };
    this.loadPersonas();
  }

  /**
   * Cambiar página
   */
  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadPersonas();
  }

  /**
   * Abrir modal para crear persona
   */
  openCreateModal(): void {
    this.editingPersona = null;
    this.showFormModal = true;
  }

  /**
   * Abrir modal para editar persona
   */
  openEditModal(persona: Persona): void {
    this.editingPersona = persona;
    this.showFormModal = true;
  }

  /**
   * Cerrar modal de formulario
   */
  closeFormModal(): void {
    this.showFormModal = false;
    this.editingPersona = null;
  }

  /**
   * Manejar persona guardada
   */
  onPersonaSaved(): void {
    this.closeFormModal();
    this.loadPersonas();
    this.loadStats();
  }

  /**
   * Eliminar persona
   */
  onDeletePersona(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
      return;
    }

    this.personasService.deletePersona(id).subscribe({
      next: () => {
        this.loadPersonas();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error al eliminar persona:', err);
        alert('Error al eliminar la persona. Por favor, intenta nuevamente.');
      }
    });
  }

  /**
   * Refrescar datos
   */
  refresh(): void {
    this.loadPersonas();
    this.loadStats();
  }
}