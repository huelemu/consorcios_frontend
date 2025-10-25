import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Persona } from '../../models/persona.model';
import { PersonaCardComponent } from '../persona-card/persona-card';

@Component({
  selector: 'app-personas-cards',
  standalone: true,
  imports: [CommonModule, PersonaCardComponent],
  templateUrl: './personas-cards.html',
  styleUrls: ['./personas-cards.scss']
})
export class PersonasCardsComponent {
  @Input() personas: Persona[] = [];
  @Output() edit = new EventEmitter<Persona>();
  @Output() delete = new EventEmitter<number>();
  @Output() view = new EventEmitter<Persona>();

  /**
   * Maneja el evento de editar desde la card hija
   */
  onEdit(persona: Persona): void {
    this.edit.emit(persona);
  }

  /**
   * Maneja el evento de eliminar desde la card hija
   */
  onDelete(id: number): void {
    this.delete.emit(id);
  }

  /**
   * Maneja el evento de ver desde la card hija
   */
  onView(persona: Persona): void {
    this.view.emit(persona);
  }

  /**
   * Track by function para optimizar el rendering
   */
  trackByPersonaId(index: number, persona: Persona): number {
    return persona.id;
  }
}