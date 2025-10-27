import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor, formatCUIT, ESTADO_PROVEEDOR_COLORS, ESTADO_PROVEEDOR_ICONS } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proveedor-detalle.component.html',
  styleUrls: ['./proveedor-detalle.component.scss']
})
export class ProveedorDetalleComponent implements OnInit {
  proveedor: Proveedor | null = null;
  tickets: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProveedor(id);
      this.loadTickets(id);
    }
  }

  loadProveedor(id: number): void {
    this.loading = true;
    this.error = null;

    this.proveedoresService.getProveedorById(id).subscribe({
      next: (proveedor) => {
        this.proveedor = proveedor;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedor:', err);
        this.error = 'Error al cargar el proveedor.';
        this.loading = false;
      }
    });
  }

  loadTickets(proveedorId: number): void {
    this.proveedoresService.getTicketsProveedor(proveedorId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
      }
    });
  }

  formatCuit(cuit: string): string {
    return formatCUIT(cuit);
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? ESTADO_PROVEEDOR_COLORS.activo : ESTADO_PROVEEDOR_COLORS.inactivo;
  }

  getEstadoIcon(activo: boolean): string {
    return activo ? ESTADO_PROVEEDOR_ICONS.activo : ESTADO_PROVEEDOR_ICONS.inactivo;
  }

  getInitials(): string {
    if (!this.proveedor) return '';
    const nombre = this.proveedor.razon_social || '';
    const words = nombre.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/proveedores']);
  }

  onEdit(): void {
    // TODO: Implementar modal de edición
    console.log('Editar proveedor:', this.proveedor);
  }

  onToggleEstado(): void {
    if (!this.proveedor) return;

    this.proveedoresService.toggleEstado(this.proveedor.id).subscribe({
      next: (updatedProveedor) => {
        this.proveedor = updatedProveedor;
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar el estado del proveedor.');
      }
    });
  }

  getTicketsColor(tipo: 'pendientes' | 'resueltos'): string {
    if (!this.proveedor) return 'text-gray-600';
    
    if (tipo === 'resueltos') return 'text-green-600';
    
    const pendientes = this.proveedor.tickets_pendientes || 0;
    if (pendientes === 0) return 'text-green-600';
    if (pendientes <= 3) return 'text-yellow-600';
    return 'text-red-600';
  }
}