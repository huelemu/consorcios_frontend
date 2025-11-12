import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TicketsService } from '../../services/tickets.service';
import { Ticket, TicketFilters } from '../../models/ticket.model';
import { TicketFormComponent } from '../../components/ticket-form/ticket-form.component';
import { TicketEditDialogComponent } from '../../components/ticket-edit-dialog/ticket-edit-dialog.component';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './tickets-page.component.html',
  styleUrls: ['./tickets-page.component.scss'],
})
export class TicketsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private ticketsService = inject(TicketsService);
  private authService = inject(AuthService);

  activeView: 'list' | 'cards' | 'kanban' = 'kanban';
  showFilters = true;
  isLoading = false;

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  
  stats = {
    total: 0,
    abiertos: 0,
    proceso: 0,
    pendientes: 0,
    cerrados: 0,
  };

  draggedTicket: Ticket | null = null;

  filtersForm = this.fb.group({
    search: [''],
    estado: [''],
    prioridad: [''],
    tipo: [''],
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    const params: TicketFilters = {
      search: this.filtersForm.value.search ?? undefined,
      estado: this.filtersForm.value.estado ?? undefined,
      prioridad: this.filtersForm.value.prioridad ?? undefined,
      tipo: this.filtersForm.value.tipo ?? undefined,
    };
    this.ticketsService
      .getTickets(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((data) => {
        this.tickets = data;
        this.filteredTickets = data;
        this.updateStats();
      });
  }

  updateStats(): void {
    this.stats.total = this.tickets.length;
    this.stats.abiertos = this.tickets.filter((t) => t.estado === 'abierto').length;
    this.stats.proceso = this.tickets.filter((t) => t.estado === 'en_proceso').length;
    this.stats.pendientes = this.tickets.filter((t) => t.estado === 'pendiente').length;
    this.stats.cerrados = this.tickets.filter((t) => t.estado === 'cerrado' || t.estado === 'resuelto').length;
  }

  limpiarFiltros(): void {
    this.filtersForm.reset({
      search: '',
      estado: '',
      prioridad: '',
      tipo: '',
    });
    this.loadTickets();
  }

  setView(view: 'list' | 'cards' | 'kanban'): void {
    this.activeView = view;
  }

  // ========================================
  // HELPERS DE VISUALIZACIÓN
  // ========================================
  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      abierto: 'bg-green-100 text-green-700 border-green-200',
      en_proceso: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      pendiente: 'bg-orange-100 text-orange-700 border-orange-200',
      resuelto: 'bg-blue-100 text-blue-700 border-blue-200',
      cerrado: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return map[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      abierto: 'Abierto',
      en_proceso: 'En Proceso',
      pendiente: 'Pendiente',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
    };
    return map[estado] || estado;
  }

  getPrioridadColor(prioridad: string): string {
    const map: Record<string, string> = {
      baja: 'text-gray-600',
      media: 'text-yellow-600',
      alta: 'text-orange-600',
      critica: 'text-red-600',
    };
    return map[prioridad] || 'text-gray-600';
  }

  // ========================================
  // KANBAN: Filtrar tickets por estado
  // ========================================
  getTicketsByEstado(estado: string): Ticket[] {
    return this.filteredTickets.filter(t => t.estado === estado);
  }

  // ========================================
  // DRAG & DROP
  // ========================================
  onDragStart(event: DragEvent, ticket: Ticket): void {
    this.draggedTicket = ticket;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', '');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, nuevoEstado: string): void {
    event.preventDefault();
    
    if (!this.draggedTicket) return;

    const estadoAnterior = this.draggedTicket.estado;
    
    if (estadoAnterior === nuevoEstado) {
      this.draggedTicket = null;
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id;

    this.ticketsService.updateTicketEstado(this.draggedTicket.id, nuevoEstado, userId)
      .subscribe({
        next: () => {
          if (this.draggedTicket) {
            this.draggedTicket.estado = nuevoEstado as any;
          }
          this.updateStats();
          this.draggedTicket = null;
        },
        error: (err) => {
          console.error('Error al cambiar el estado del ticket:', err);
          this.draggedTicket = null;
        }
      });
  }

  // ========================================
  // MODALS
  // ========================================
  openCreateDialog(): void {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || 1;

    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { userId },
    });

    dialogRef.componentInstance.saved.subscribe((ticket) => {
      this.openEditDialog(ticket);
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadTickets();
    });
  }

  openEditDialog(ticket: Ticket): void {
    const dialogRef = this.dialog.open(TicketEditDialogComponent, {
      width: '95vw',
      height: '90vh',
      maxWidth: 'none',
      panelClass: 'dialog-fullscreen',
      data: { ticket },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadTickets();
    });
  }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  }
}