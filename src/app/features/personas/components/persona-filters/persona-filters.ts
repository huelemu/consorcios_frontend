import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PersonasFilters } from '../../models/persona.model';

@Component({
  selector: 'app-persona-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './persona-filters.html',
  styleUrls: ['./persona-filters.scss']
})
export class PersonaFiltersComponent implements OnInit, OnDestroy {
  @Input() filters: PersonasFilters = {};
  @Output() filtersChange = new EventEmitter<PersonasFilters>();

  // Observable para búsqueda con debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Control de visibilidad de filtros
  showFilters = true;

  // Valores locales del formulario
  searchTerm = '';
  tipoPersona: 'fisica' | 'juridica' | '' = '';
  provincia = '';
  sortBy = 'fecha_creacion';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  // Opciones para los selects
  tiposPersona = [
    { value: '', label: 'Todas' },
    { value: 'fisica', label: 'Persona Física' },
    { value: 'juridica', label: 'Persona Jurídica' }
  ];

  provincias = [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  camposOrdenamiento = [
    { value: 'fecha_creacion', label: 'Fecha de Creación' },
    { value: 'nombre', label: 'Nombre' },
    { value: 'apellido', label: 'Apellido' },
    { value: 'documento', label: 'Documento' },
    { value: 'email', label: 'Email' }
  ];

  ngOnInit(): void {
    // Inicializar valores desde los filtros recibidos
    if (this.filters) {
      this.searchTerm = this.filters.search || '';
      this.tipoPersona = this.filters.tipo_persona || '';
      this.provincia = this.filters.provincia || '';
      this.sortBy = this.filters.sortBy || 'fecha_creacion';
      this.sortOrder = this.filters.sortOrder || 'DESC';
    }

    // Configurar debounce para búsqueda (espera 500ms después de que el usuario deje de escribir)
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((searchValue) => {
        this.emitFilters();
      });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  /**
   * Maneja el cambio en el input de búsqueda
   */
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  /**
   * Maneja el cambio en el select de tipo de persona
   */
  onTipoPersonaChange(): void {
    this.emitFilters();
  }

  /**
   * Maneja el cambio en el select de provincia
   */
  onProvinciaChange(): void {
    this.emitFilters();
  }

  /**
   * Maneja el cambio en el ordenamiento
   */
  onSortChange(): void {
    this.emitFilters();
  }

  /**
   * Alterna entre orden ascendente y descendente
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    this.emitFilters();
  }

  /**
   * Alterna la visibilidad de los filtros
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.tipoPersona = '';
    this.provincia = '';
    this.sortBy = 'fecha_creacion';
    this.sortOrder = 'DESC';
    this.emitFilters();
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.tipoPersona ||
      this.provincia ||
      this.sortBy !== 'fecha_creacion' ||
      this.sortOrder !== 'DESC'
    );
  }

  /**
   * Emite los filtros actuales al componente padre
   */
  private emitFilters(): void {
    const newFilters: PersonasFilters = {
      search: this.searchTerm,
      tipo_persona: this.tipoPersona,
      provincia: this.provincia,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.filtersChange.emit(newFilters);
  }
}