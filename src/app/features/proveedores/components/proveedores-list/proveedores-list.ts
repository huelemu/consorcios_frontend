import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Proveedor, ESTADO_PROVEEDOR_COLORS, ESTADO_PROVEEDOR_ICONS, formatCUIT } from '../../models/proveedor.model';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proveedores-list.html',
  styleUrls: ['./proveedores-list.scss']
})
export class ProveedoresListComponent {
  @Input() proveedores: Proveedor[] = [];
  @Output() edit = new EventEmitter<Proveedor>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggleEstado = new EventEmitter<number>();

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? ESTADO_PROVEEDOR_COLORS.activo : ESTADO_PROVEEDOR_COLORS.inactivo;
  }

  getEstadoIcon(activo: boolean): string {
    return activo ? ESTADO_PROVEEDOR_ICONS.activo : ESTADO_PROVEEDOR_ICONS.inactivo;
  }

  formatCuit(cuit: string): string {
    return formatCUIT(cuit);
  }

  getInitials(proveedor: Proveedor): string {
    const nombre = proveedor.razon_social || '';
    const words = nombre.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  onEdit(proveedor: Proveedor): void {
    this.edit.emit(proveedor);
  }

  onDelete(id: number): void {
    this.delete.emit(id);
  }

  onToggleEstado(id: number): void {
    this.toggleEstado.emit(id);
  }

  getTicketsColor(proveedor: Proveedor): string {
    const pendientes = proveedor.tickets_pendientes || 0;
    if (pendientes === 0) return 'text-green-600';
    if (pendientes <= 3) return 'text-yellow-600';
    return 'text-red-600';
  }
}