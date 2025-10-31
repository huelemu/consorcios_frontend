import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, finalize, forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketFormComponent } from '../../components/ticket-form/ticket-form.component';
import {
  Ticket,
  TicketFilters,
  TicketMetricSummary,
  TicketPriority,
  TicketState,
  TicketType
} from '../../models/ticket.model';
import {
  TicketConsorcioOption,
  TicketProveedorOption,
  TicketUnidadOption,
  TicketsService
} from '../../services/tickets.service';

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
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './tickets-page.component.html',
  styleUrls: ['./tickets-page.component.scss']
})
export class TicketsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ticketsService = inject(TicketsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  consorcios: TicketConsorcioOption[] = [];
  unidades: TicketUnidadOption[] = [];
  proveedores: TicketProveedorOption[] = [];
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
  filtersErrorMessage: string | null = null;
  ticketsErrorMessage: string | null = null;
  isLoadingFilters = false;
  isLoadingTickets = false;

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadTickets();
    this.filtersForm.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTickets());
  }

  /** =============================
   *  MÉTODOS DE DATOS
   * ============================= */

  private loadFilterOptions(): void {
    this.isLoadingFilters = true;
    forkJoin({
      consorcios: this.ticketsService.getConsorcios(),
      unidades: this.ticketsService.getUnidades(),
      proveedores: this.ticketsService.getProveedores()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoadingFilters = false;
        })
      )
      .subscribe({
        next: ({ consorcios, unidades, proveedores }) => {
          this.consorcios = consorcios;
          this.unidades = unidades;
          this.proveedores = proveedores;
          this.filtersErrorMessage = null;
        },
        error: () => {
          this.filtersErrorMessage = 'No pudimos cargar los datos para los filtros. Por favor, intentá nuevamente.';
        }
      });
  }

  loadTickets(): void {
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

    this.isLoadingTickets = true;
    this.ticketsErrorMessage = null;

    this.ticketsService
      .getTickets(filters)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoadingTickets = false;
        })
      )
      .subscribe({
        next: tickets => {
          this.tickets = tickets;
          this.filteredTickets = tickets;
          this.summary = this.buildSummary(tickets);

          if (this.selectedTicket) {
            const stillVisible = tickets.find(ticket => ticket.id === this.selectedTicket?.id);
            this.selectedTicket = stillVisible ?? null;
          }
        },
        error: () => {
          this.tickets = [];
          this.filteredTickets = [];
          this.summary = this.buildSummary([]);
          this.selectedTicket = null;
          this.ticketsErrorMessage = 'No pudimos obtener la lista de tickets. Reintentá más tarde.';
        }
      });
  }

  /** =============================
   *  MÉTODOS AUXILIARES
   * ============================= */

  get errorMessages(): string[] {
    return [this.filtersErrorMessage, this.ticketsErrorMessage].filter((message): message is string => !!message);
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

  /** =============================
   *  MÉTODOS DE PRESENTACIÓN
   * ============================= */

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

  getEstadoLabel(estado: TicketState): string {
    return this.getEstadoOption(estado)?.label ?? estado;
  }

  getEstadoIcon(estado: TicketState): string {
    return this.getEstadoOption(estado)?.icon ?? '🎫';
  }

  /** =============================
   *  FORMATO Y VISUALIZACIÓN
   * ============================= */

  formatDate(value?: string, includeTime = false): string {
    if (!value) return '—';
    const date = new Date(value);
    return includeTime
      ? date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
      : date.toLocaleDateString('es-AR', { dateStyle: 'short' });
  }

  getHistorialIcon(action: string): string {
    switch (action) {
      case 'creado':
        return '🆕';
      case 'actualizado':
        return '✏️';
      case 'estado':
        return '🔄';
      case 'asignado':
        return '👤';
      case 'comentario':
        return '💬';
      case 'adjunto':
        return '📎';
      case 'costos':
        return '💰';
      default:
        return '📘';
    }
  }
    /** =============================
   *  MÉTODOS DE PRESENTACIÓN EXTRA
   * ============================= */

  getUnidadDisplay(ticket: Ticket): string {
    if (!ticket.unidadNombre && !ticket.consorcioNombre) return 'Sin unidad asociada';
    const unidad = ticket.unidadNombre ? `Unidad ${ticket.unidadNombre}` : '';
    const consorcio = ticket.consorcioNombre ? ` · ${ticket.consorcioNombre}` : '';
    return `${unidad}${consorcio}`.trim();
  }

  getEstadoBadgeClass(estado: TicketState): string {
    switch (estado) {
      case 'abierto':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pendiente':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'resuelto':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cerrado':
        return 'bg-gray-200 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getResponsableDisplay(ticket: Ticket): string {
    if (ticket.asignadoANombre) return ticket.asignadoANombre;
    if (ticket.proveedorNombre) return `${ticket.proveedorNombre} (${ticket.proveedorRubro ?? 'Proveedor'})`;
    return ticket.asignadoRol ? `Asignado a ${ticket.asignadoRol}` : 'Sin responsable asignado';
  }

  getCostoDisplay(ticket: Ticket): string {
    if (ticket.costoFinal) return `${ticket.costoFinal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`;
    if (ticket.estimacionCosto) return `${ticket.estimacionCosto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`;
    return 'N/D';
  }

  getNotificationSummary(ticket: Ticket): string {
    if (!ticket.notificaciones) return 'Sin notificaciones configuradas';
    const n = ticket.notificaciones;
    const enabled = Object.entries(n)
      .filter(([_, v]) => v)
      .map(([k]) => {
        switch (k) {
          case 'notifyCreator': return 'Creador';
          case 'notifyProvider': return 'Proveedor';
          case 'notifyPropietario': return 'Propietario';
          case 'notifyInquilino': return 'Inquilino';
          case 'notifyEncargado': return 'Encargado';
          default: return k;
        }
      });
    return enabled.length > 0 ? `Se notificará a: ${enabled.join(', ')}` : 'Sin notificaciones activas';
  }

openCreateDialog(): void {
  const dialogRef = this.dialog.open(TicketFormComponent, {
    width: '700px',
    maxHeight: '90vh',
    panelClass: 'custom-dialog-container', // 👈 importante
    data: {
      consorcioId: null,
      unidadId: null
    }
  });

  dialogRef.afterClosed().subscribe((result: any) => {
    if (result) this.loadTickets();
  });
}


}
