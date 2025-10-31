import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss']
})
export class ModalHeaderComponent {
  /** Texto del título */
  @Input() title = 'Título';

  /** Nombre del ícono Material */
  @Input() icon = 'info';

  /** Color manual (opcional si no se usa "module") */
  @Input() color?: 'cyan' | 'orange' | 'emerald' | 'indigo' | 'violet' | 'red';

  /** Módulo: determina color automáticamente */
  @Input() module?: 'consorcio' | 'persona' | 'usuario' | 'unidad' | 'proveedor' | 'ticket';

  /** Evento de cierre */
  @Output() close = new EventEmitter<void>();

  /** Obtiene el color según el módulo (prioridad sobre color manual) */
  get effectiveColor(): string {
    if (this.module) {
      const map: Record<string, string> = {
        consorcio: 'indigo',
        persona: 'emerald',
        usuario: 'violet',
        unidad: 'orange',
        proveedor: 'red',
        ticket: 'cyan'
      };
      return map[this.module] ?? 'cyan';
    }
    return this.color ?? 'cyan';
  }

  /** Clases de texto */
  get textClasses(): string {
    const map: Record<string, string> = {
      cyan: 'text-cyan-700',
      orange: 'text-orange-700',
      emerald: 'text-emerald-700',
      indigo: 'text-indigo-700',
      violet: 'text-violet-700',
      red: 'text-red-700'
    };
    return map[this.effectiveColor] ?? 'text-cyan-700';
  }

  /** Clases del ícono */
  get iconClasses(): string {
    const map: Record<string, string> = {
      cyan: 'text-cyan-600',
      orange: 'text-orange-600',
      emerald: 'text-emerald-600',
      indigo: 'text-indigo-600',
      violet: 'text-violet-600',
      red: 'text-red-600'
    };
    return map[this.effectiveColor] ?? 'text-cyan-600';
  }
}