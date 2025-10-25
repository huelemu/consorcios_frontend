import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Persona } from '../../models/persona.model';
import { PersonasService } from '../../services/personas.service';

@Component({
  selector: 'app-persona-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './persona-card.html',
  styleUrls: ['./persona-card.scss']
})
export class PersonaCardComponent {
  @Input() persona!: Persona;
  @Output() edit = new EventEmitter<Persona>();
  @Output() delete = new EventEmitter<number>();
  @Output() view = new EventEmitter<Persona>();

  constructor(private personasService: PersonasService) {}

  /**
   * Obtiene las iniciales de la persona para el avatar
   */
  getInitials(): string {
    return this.personasService.getInitials(this.persona);
  }

  /**
   * Obtiene el nombre completo de la persona
   */
  getFullName(): string {
    return this.personasService.getFullName(this.persona);
  }

  /**
   * Emite evento para editar persona
   */
  onEdit(): void {
    this.edit.emit(this.persona);
  }

  /**
   * Emite evento para eliminar persona
   */
  onDelete(): void {
    this.delete.emit(this.persona.id);
  }

  /**
   * Emite evento para ver detalle de persona
   */
  onView(): void {
    this.view.emit(this.persona);
  }

  /**
   * Obtiene el color del badge según el tipo de persona
   */
  getTipoBadgeClass(): string {
    return this.persona.tipo_persona === 'fisica' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-purple-100 text-purple-800';
  }

  /**
   * Obtiene el ícono según el tipo de persona
   */
  getTipoIcon(): string {
    return this.persona.tipo_persona === 'fisica' ? '👤' : '🏢';
  }

  /**
   * Obtiene el label del tipo de persona
   */
  getTipoLabel(): string {
    return this.persona.tipo_persona === 'fisica' ? 'Persona Física' : 'Persona Jurídica';
  }

  /**
   * Formatea la fecha de creación
   */
  formatDate(): string {
    if (!this.persona.fecha_creacion) return '-';
    const date = new Date(this.persona.fecha_creacion);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Obtiene la ubicación completa
   */
  getLocation(): string {
    const parts = [];
    if (this.persona.localidad) parts.push(this.persona.localidad);
    if (this.persona.provincia) parts.push(this.persona.provincia);
    return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
  }

  /**
   * Verifica si tiene información de contacto
   */
  hasContactInfo(): boolean {
    return !!(this.persona.email || this.persona.telefono);
  }
}