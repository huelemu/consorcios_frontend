import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedoresListComponent } from '../../components/proveedores-list/proveedores-list';
import { ProveedoresCardsComponent } from '../../components/proveedores-cards/proveedores-cards';
import { ProveedorFiltersComponent } from '../../components/proveedor-filters/proveedor-filters';
import { ProveedorFormModalComponent } from '../../components/proveedor-form-modal/proveedor-form-modal.component';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor, ProveedorFilters, ProveedoresStats } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedores-page',
  standalone: true,
  imports: [
    CommonModule,
    ProveedoresListComponent,
    ProveedoresCardsComponent,
    ProveedorFiltersComponent,
    ProveedorFormModalComponent
  ],
  templateUrl: './proveedores-page.component.html',
  styleUrls: ['./proveedores-page.component.scss']
})
export class ProveedoresPageComponent implements OnInit {
  activeView: 'list' | 'cards' = 'list';

  proveedores: Proveedor[] = [];
  stats: ProveedoresStats | null = null;

  loading = false;
  error: string | null = null;

  // Modal state
  showFormModal = false;
  selectedProveedor: Proveedor | null = null;

  currentPage = 1;
  limit = 12;
  totalPages = 1;
  total = 0;

  filters: ProveedorFilters = {
    page: 1,
    limit: 12,
    search: '',
    rubro: undefined,
    activo: undefined,
    sortBy: 'razon_social',
    sortOrder: 'ASC'
  };

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit(): void {
    this.loadProveedores();
    this.loadStats();
  }

  loadProveedores(): void {
    this.loading = true;
    this.error = null;

    this.proveedoresService.getProveedores(this.filters).subscribe({
      next: (response) => {
        // ✅ Si el backend devuelve un array plano
        if (Array.isArray(response)) {
          this.proveedores = response;
          this.total = response.length;
          this.currentPage = 1;
          this.totalPages = 1;
        }
        // ✅ Si en el futuro devolvés paginación desde el backend
        else if (response.data) {
          this.proveedores = response.data;
          this.currentPage = response.pagination?.page ?? 1;
          this.limit = response.pagination?.limit ?? 12;
          this.totalPages = response.pagination?.totalPages ?? 1;
          this.total = response.pagination?.total ?? response.data.length;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.error = 'Error al cargar los proveedores. Por favor, intenta nuevamente.';
        this.loading = false;
        this.proveedores = [];
      }
    });
  }

  loadStats(): void {
    this.proveedoresService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  setView(view: 'list' | 'cards'): void {
    this.activeView = view;
  }

  onFiltersChange(newFilters: ProveedorFilters): void {
    this.filters = { ...this.filters, ...newFilters, page: 1 };
    this.loadProveedores();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProveedores();
  }

  openCreateModal(): void {
    this.selectedProveedor = null;
    this.showFormModal = true;
  }

  onEditProveedor(proveedor: Proveedor): void {
    this.selectedProveedor = proveedor;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedProveedor = null;
  }

  onProveedorSaved(proveedor: Proveedor): void {
    console.log('Proveedor guardado:', proveedor);
    this.loadProveedores();
    this.loadStats();
  }

  onDeleteProveedor(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;

    this.proveedoresService.deleteProveedor(id).subscribe({
      next: () => {
        this.loadProveedores();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error al eliminar proveedor:', err);
        alert('Error al eliminar el proveedor. Por favor, intenta nuevamente.');
      }
    });
  }

  onToggleEstado(id: number): void {
    this.proveedoresService.toggleEstado(id).subscribe({
      next: () => {
        this.loadProveedores();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar el estado del proveedor.');
      }
    });
  }

  refresh(): void {
    this.loadProveedores();
    this.loadStats();
  }
}
