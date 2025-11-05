import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../models/ticket.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketActionsDialogComponent } from '../ticket-actions-dialog/ticket-actions-dialog.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div *ngIf="ticket" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold">{{ ticket.titulo }}</h3>
          <div class="mt-1 text-xs text-gray-500">{{ ticket.consorcioNombre }} · UF: {{ ticket.unidadNombre }}</div>
        </div>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <p class="text-gray-700 whitespace-pre-line">{{ ticket.descripcion }}</p>

      <div class="flex flex-wrap gap-2">
        <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {{ ticket.estado | titlecase }}
        </span>
        <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Prioridad: {{ ticket.prioridad | titlecase }}
        </span>
        <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Responsable: {{ ticket.asignadoANombre || ticket.proveedorNombre || '—' }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" (click)="openActions('estado')">Cambiar estado</button>
        <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" (click)="openActions('asignacion')">Reasignar</button>
        <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" (click)="openActions('costos')">Cargar costos</button>
        <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" (click)="openActions('comentario')">Comentar</button>
        <button class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" (click)="openActions('adjunto')">Adjuntar archivo</button>
      </div>
    </div>
  `
})
export class TicketDetailComponent {
  @Input() ticket: Ticket | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<void>();

  private dialog = inject(MatDialog);

  openActions(initialTab: 'estado' | 'asignacion' | 'costos' | 'comentario' | 'adjunto') {
    if (!this.ticket) return;
    const ref = this.dialog.open(TicketActionsDialogComponent, {
      width: '640px',
      data: { ticket: this.ticket, initialTab }
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.ticketUpdated.emit(); });
  }
}
