import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnidadFuncional } from '../../models/unidad.model';
import { UnidadBasic } from '../../../consorcios/models/consorcio.model';

@Component({
  selector: 'app-unidad-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unidad-card.component.html'
})
export class UnidadCardComponent {

  @Input() unidad!: UnidadFuncional | UnidadBasic;
  @Output() onView = new EventEmitter<UnidadFuncional | UnidadBasic>();
  @Output() onEdit = new EventEmitter<UnidadFuncional | UnidadBasic>();
  @Output() onDelete = new EventEmitter<UnidadFuncional | UnidadBasic>();
  @Output() onCreateTicket = new EventEmitter<UnidadFuncional | UnidadBasic>();

  getEstadoBadgeClass(): string {
    switch (this.unidad.estado) {
      case 'ocupado': return 'bg-green-100 text-green-800 border-green-200';
      case 'vacante': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mantenimiento': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getEstadoLabel(): string {
    switch (this.unidad.estado) {
      case 'ocupado': return 'Ocupado';
      case 'vacante': return 'Vacante';
      case 'mantenimiento': return 'En Mantenimiento';
      default: return 'Desconocido';
    }
  }

  getEstadoIcon(): string {
    switch (this.unidad.estado) {
      case 'ocupado': return '✅';
      case 'vacante': return '🚪';
      case 'mantenimiento': return '🔧';
      default: return '❓';
    }
  }

  tieneTicketsPendientes(): boolean {
    return (this.unidad.tickets_count || 0) > 0;
  }

  getOcupanteInfo(): string {
    if (!this.unidad.personas || this.unidad.personas.length === 0) {
      return 'Sin asignar';
    }

    const propietario = this.unidad.personas.find(p => p.rol_unidad === 'propietario');
    const inquilino = this.unidad.personas.find(p => p.rol_unidad === 'inquilino');

    if (inquilino) {
      return `${inquilino.nombre} ${inquilino.apellido} (Inquilino)`;
    }
    
    if (propietario) {
      return `${propietario.nombre} ${propietario.apellido} (Propietario)`;
    }

    return 'Sin asignar';
  }
}