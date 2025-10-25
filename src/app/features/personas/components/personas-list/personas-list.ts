import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Persona } from '../../models/persona.model';
import { PersonasService } from '../../services/personas.service';

@Component({
  selector: 'app-personas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personas-list.html',
  styleUrls: ['./personas-list.scss']
})
export class PersonasListComponent {
  @Input() personas: Persona[] = [];
  @Output() edit = new EventEmitter<Persona>();
  @Output() delete = new EventEmitter<number>();
  @Output() view = new EventEmitter<Persona>();

  constructor(private personasService: PersonasService) {}

  /**
   * Obtiene las iniciales de una persona para el avatar
   */
  getInitials(persona: Persona): string {
    return this.personasService.getInitials(persona);
  }

  /**
   * Obtiene el nombre completo de una persona
   */
  getFullName(persona: Persona): string {
    return this.personasService.getFullName(persona);
  }

  /**
   * Emite evento para editar persona
   */
  onEdit(persona: Persona): void {
    this.edit.emit(persona);
  }

  /**
   * Emite evento para eliminar persona
   */
  onDelete(id: number): void {
    this.delete.emit(id);
  }

  /**
   * Emite evento para ver detalle de persona
   */
  onView(persona: Persona): void {
    this.view.emit(persona);
  }

  /**
   * Obtiene el color del badge según el tipo de persona
   */
  getTipoBadgeClass(tipo: string): string {
    return tipo === 'fisica' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-purple-100 text-purple-800';
  }

  /**
   * Obtiene el icono según el tipo de persona
   */
  getTipoIcon(tipo: string): string {
    return tipo === 'fisica' ? '👤' : '🏢';
  }

  /**
   * Formatea la fecha de creación
   */
  formatDate(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Trunca texto largo
   */
  truncate(text: string | undefined, length: number = 30): string {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}