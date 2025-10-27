import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import {
  Ticket,
  TicketFilters,
  TicketMetricSummary,
  TicketPriority,
  TicketState,
  TicketType
} from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';

interface EstadoOption {
  value: TicketState;
  label: string;
  icon: string;
}

interface RolAsignadoOption {
  value: NonNullable<Ticket['asignadoRol']>;
  label: string;
}

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tickets-page.component.html',
  styleUrl: './tickets-page.component.scss'
})
export class TicketsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ticketsService = inject(TicketsService);
   private readonly destroyRef = inject(DestroyRef);

  readonly consorcios = this.ticketsService.getConsorcios();
  readonly unidades = this.ticketsService.getUnidades();
  readonly proveedores = this.ticketsService.getProveedores();
  readonly prioridades = this.ticketsService.getPrioridades();
  readonly tipos = this.ticketsService.getTipos();

  readonly estados: EstadoOption[] = [
    { value: 'abierto', label: 'Abierto', icon: '🆕' },
    { value: 'en_proceso', label: 'En proceso', icon: '⚙️' },
    { value: 'pendiente', label: 'Pendiente', icon: '⏳' },
    { value: 'resuelto', label: 'Resuelto', icon: '✅' },
    { value: 'cerrado', label: 'Cerrado', icon: '🔒' }
  ];

  readonly rolesAsignado: RolAsignadoOption[] = [
    { value: 'proveedor', label: 'Proveedor externo' },
    { value: 'encargado', label: 'Encargado del edificio' },
    { value: 'admin_consorcio', label: 'Administración del consorcio' },
    { value: 'otro', label: 'Otro responsable interno' }
  ];

  filtersForm = this.fb.nonNullable.group({
    consorcioId: this.fb.control<number | null>(null),
    unidadId: this.fb.control<number | null>(null),
    prioridad: this.fb.control<TicketPriority | null>(null),
    estado: this.fb.control<TicketState | null>(null),
    tipo: this.fb.control<TicketType | null>(null),
    asignadoRol: this.fb.control<Ticket['asignadoRol'] | null>(null),
    proveedorId: this.fb.control<number | null>(null),
    searchTerm: this.fb.control<string>('')
  });

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  summary: TicketMetricSummary[] = [];
  selectedTicket: Ticket | null = null;

  ngOnInit(): void {
    this.loadTickets();
    this.filtersForm.valueChanges
    .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.applyFilters());
  }

  onSelectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  clearFilters(): void {
    this.filtersForm.reset({
      consorcioId: null,
      unidadId: null,
      prioridad: null,
      estado: null,
      tipo: null,
      asignadoRol: null,
      proveedorId: null,
      searchTerm: ''
    });
  }

  trackByTicketId(_index: number, ticket: Ticket): number {
    return ticket.id;
  }

  getPrioridadBadgeClass(prioridad: TicketPriority): string {
    switch (prioridad) {
      case 'baja':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'alta':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'critica':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getEstadoBadgeClass(estado: TicketState): string {
    switch (estado) {
      case 'abierto':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_proceso':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pendiente':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resuelto':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cerrado':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDate(value?: string, withTime: boolean = false): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: withTime ? '2-digit' : undefined,
      minute: withTime ? '2-digit' : undefined
    });
  }

  getUnidadDisplay(ticket: Ticket): string {
    return `${ticket.unidadNombre} · ${ticket.consorcioNombre}`;
  }

  getResponsableDisplay(ticket: Ticket): string {
    if (ticket.proveedorNombre) {
      return `${ticket.proveedorNombre} (${ticket.proveedorRubro ?? 'Proveedor'})`;
    }

    if (ticket.asignadoANombre) {
      return `${ticket.asignadoANombre} (${this.getRolAsignadoLabel(ticket.asignadoRol)})`;
    }

    return 'Sin responsable asignado';
  }

  getRolAsignadoLabel(value?: Ticket['asignadoRol']): string {
    const rol = this.rolesAsignado.find(item => item.value === value);
    return rol?.label ?? 'Responsable';
  }

  getNotificationSummary(ticket: Ticket): string {
    const recipients: string[] = [];

    if (ticket.notificaciones.notifyCreator) {
      recipients.push('Creador');
    }
    if (ticket.notificaciones.notifyProvider) {
      recipients.push('Proveedor');
    }
    if (ticket.notificaciones.notifyPropietario) {
      recipients.push('Propietario');
    }
    if (ticket.notificaciones.notifyInquilino) {
      recipients.push('Inquilino');
    }
    if (ticket.notificaciones.notifyEncargado) {
      recipients.push('Encargado');
    }

    return recipients.length > 0 ? recipients.join(', ') : 'Sin notificaciones configuradas';
  }

  getCostoDisplay(ticket: Ticket): string {
    if (ticket.costoFinal) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
        ticket.costoFinal
      );
    }

    if (ticket.estimacionCosto) {
      return `Estimado: ${new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(ticket.estimacionCosto)}`;
    }

    return 'Sin estimación';
  }

  getHistorialIcon(action: Ticket['historial'][number]['action']): string {
    switch (action) {
      case 'creado':
        return '📝';
      case 'asignado':
        return '👤';
      case 'estado':
        return '🔄';
      case 'comentario':
        return '💬';
      case 'adjunto':
        return '📎';
      case 'costos':
        return '💰';
      case 'actualizado':
      default:
        return '✏️';
    }
  }

  getEstadoLabel(estado: TicketState): string {
    return this.getEstadoOption(estado)?.label ?? estado;
  }

  getEstadoIcon(estado: TicketState): string {
    return this.getEstadoOption(estado)?.icon ?? '🎫';
  }

  private loadTickets(): void {
    this.tickets = this.ticketsService.getTickets();
    this.applyFilters();
  }

  private applyFilters(): void {
    const formValue = this.filtersForm.getRawValue();

    const filters: TicketFilters = Object.entries(formValue).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== '') {
          (acc as Record<string, unknown>)[key] = value;
        }
        return acc;
      },
      {} as TicketFilters
    );

    this.filteredTickets = this.ticketsService.getTickets(filters);
    this.summary = this.buildSummary(this.filteredTickets);

    if (this.selectedTicket) {
      const stillVisible = this.filteredTickets.find(ticket => ticket.id === this.selectedTicket?.id);
      this.selectedTicket = stillVisible ?? null;
    }
  }

  private buildSummary(tickets: Ticket[]): TicketMetricSummary[] {
    return this.estados.map(({ value, label, icon }) => ({
      estado: value,
      label,
      icon,
      count: tickets.filter(ticket => ticket.estado === value).length,
      trend: 'stable' as const,
      variation: 0
    }));
  }

  private getEstadoOption(estado: TicketState): EstadoOption | undefined {
    return this.estados.find(item => item.value === estado);
  }
}
