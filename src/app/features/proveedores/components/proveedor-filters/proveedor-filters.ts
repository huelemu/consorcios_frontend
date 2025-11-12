import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorFilters, RUBROS_COMUNES } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-filters.html',
  styleUrls: ['./proveedor-filters.scss']
})
export class ProveedorFiltersComponent {
  @Input() filters: ProveedorFilters = {};
  @Output() filtersChange = new EventEmitter<ProveedorFilters>();

  rubrosComunes = RUBROS_COMUNES;
  showFilters = true;

  onSearchChange(search: string): void {
    this.emitFilters({ search });
  }

  onRubroChange(rubro: string): void {
    this.emitFilters({ rubro: rubro || undefined });
  }

  onEstadoChange(activo: string): void {
    this.emitFilters({ activo: activo === '' ? undefined : activo === 'true' });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      rubro: undefined,
      activo: undefined
    };
    this.filtersChange.emit(this.filters);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.rubro ||
      this.filters.activo !== undefined
    );
  }

  private emitFilters(changes: Partial<ProveedorFilters>): void {
    this.filters = { ...this.filters, ...changes };
    this.filtersChange.emit(this.filters);
  }
}