import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UnidadFilters } from '../../models/unidad.model';

@Component({
  selector: 'app-unidad-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unidad-filters.component.html'
})
export class UnidadFiltersComponent implements OnInit, OnDestroy {
  
  @Input() filters: UnidadFilters = {};
  @Input() consorcios: any[] = [];
  @Output() filtersChange = new EventEmitter<UnidadFilters>();

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  // Valores locales del formulario
  searchTerm = '';
  consorcioId: number | null = null;
  estado: 'ocupado' | 'vacante' | 'mantenimiento' | '' = '';
  tieneTiketsPendientes = false;
  sortBy = 'codigo';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  // Opciones para los selects
  estadosUnidad = [
    { value: '', label: 'Todos los estados', color: 'gray' },
    { value: 'ocupado', label: 'Ocupado', color: 'green' },
    { value: 'vacante', label: 'Vacante', color: 'yellow' },
    { value: 'mantenimiento', label: 'En Mantenimiento', color: 'red' }
  ];

  camposOrdenamiento = [
    { value: 'codigo', label: 'Código' },
    { value: 'piso', label: 'Piso' },
    { value: 'superficie', label: 'Superficie' },
    { value: 'porcentaje_participacion', label: '% Participación' }
  ];

  ngOnInit(): void {
    if (this.filters) {
      this.searchTerm = this.filters.search || '';
      this.consorcioId = this.filters.consorcio_id ? Number(this.filters.consorcio_id) : null;
      this.estado = this.filters.estado || '';
      this.tieneTiketsPendientes = this.filters.tiene_tickets_pendientes || false;
      this.sortBy = this.filters.sortBy || 'codigo';
      this.sortOrder = this.filters.sortOrder || 'ASC';
    }

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => this.emitFilters());
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onConsorcioChange(): void { this.emitFilters(); }
  onEstadoChange(): void { this.emitFilters(); }
  onTicketsPendientesChange(): void { this.emitFilters(); }
  onSortChange(): void { this.emitFilters(); }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    this.emitFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.consorcioId = null;
    this.estado = '';
    this.tieneTiketsPendientes = false;
    this.sortBy = 'codigo';
    this.sortOrder = 'ASC';
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.consorcioId ||
      this.estado ||
      this.tieneTiketsPendientes ||
      this.sortBy !== 'codigo' ||
      this.sortOrder !== 'ASC'
    );
  }

  private emitFilters(): void {
    const newFilters: UnidadFilters = {
      search: this.searchTerm,
      consorcio_id: this.consorcioId || undefined,
      estado: this.estado,
      tiene_tickets_pendientes: this.tieneTiketsPendientes,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.filtersChange.emit(newFilters);
  }

  getConsorcioNombre(): string {
    if (!this.consorcioId) return 'Todos';
    const consorcio = this.consorcios.find(c => c.id === this.consorcioId);
    return consorcio ? consorcio.nombre : 'Todos';
  }
}