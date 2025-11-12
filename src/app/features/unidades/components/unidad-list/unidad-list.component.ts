import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnidadFuncional } from '../../models/unidad.model';
import { UnidadBasic } from '../../../consorcios/models/consorcio.model';

@Component({
  selector: 'app-unidad-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consorcio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Piso</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let unidad of unidades" 
              [class]="getRowClass(unidad)"
              class="hover:bg-gray-50 transition-colors cursor-pointer">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ getEstadoIcon(unidad.estado) }}</span>
                <span class="text-sm font-medium text-gray-900">{{ unidad.codigo }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ unidad.consorcio?.nombre || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ unidad.piso || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ unidad.superficie ? (unidad.superficie + ' m²') : '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span [class]="'px-2 py-1 text-xs font-medium rounded-full ' + getEstadoBadge(unidad.estado)">
                {{ getEstadoLabel(unidad.estado) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span *ngIf="unidad.tickets_count && unidad.tickets_count > 0" 
                    class="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                🎫 {{ unidad.tickets_count }}
              </span>
              <span *ngIf="!unidad.tickets_count || unidad.tickets_count === 0" 
                    class="text-sm text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button (click)="onView.emit(unidad); $event.stopPropagation()" class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
              <button (click)="onEdit.emit(unidad); $event.stopPropagation()" class="text-green-600 hover:text-green-900 mr-3">Editar</button>
              <button (click)="onDelete.emit(unidad); $event.stopPropagation()" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class UnidadListComponent {
  @Input() unidades: (UnidadFuncional | UnidadBasic)[] = [];
  @Output() onView = new EventEmitter<UnidadFuncional | UnidadBasic>();
  @Output() onEdit = new EventEmitter<UnidadFuncional | UnidadBasic>();
  @Output() onDelete = new EventEmitter<UnidadFuncional | UnidadBasic>();

  getRowClass(unidad: UnidadFuncional | UnidadBasic): string {
    return unidad.tickets_count && unidad.tickets_count > 0 
      ? 'bg-orange-50 border-l-4 border-orange-400' 
      : '';
  }

  getEstadoIcon(estado: string): string {
    const icons: any = { ocupado: '🏠', vacante: '📦', mantenimiento: '🔧' };
    return icons[estado] || '🏠';
  }

  getEstadoLabel(estado: string): string {
    const labels: any = { ocupado: 'Ocupado', vacante: 'Vacante', mantenimiento: 'Mantenimiento' };
    return labels[estado] || estado;
  }

  getEstadoBadge(estado: string): string {
    const badges: any = {
      ocupado: 'bg-green-100 text-green-800',
      vacante: 'bg-gray-100 text-gray-800',
      mantenimiento: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  }
}