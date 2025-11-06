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

  activeView: 'list' | 'cards' | 'kanban' = 'kanban'; // Por defecto Kanban
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

  // Para drag & drop
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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setView(view: 'list' | 'cards' | 'kanban'): void {
    this.activeView = view;
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
      event.dataTransfer.setData('text/html', ''); // Necesario para Firefox
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

    console.log('🔄 Cambiando estado:', {
      ticketId: this.draggedTicket.id,
      desde: estadoAnterior,
      hacia: nuevoEstado
    });

    // Obtener userId
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.id;

    // Actualizar estado en backend
    this.ticketsService.updateTicketEstado(this.draggedTicket.id, nuevoEstado, userId)
      .subscribe({
        next: (response) => {
          console.log('✅ Response del backend:', response);
          console.log(`✅ Ticket #${this.draggedTicket?.id} movido de ${estadoAnterior} a ${nuevoEstado}`);
          
          // Actualizar estado local
          if (this.draggedTicket) {
            this.draggedTicket.estado = nuevoEstado as any;
          }
          
          this.updateStats();
          this.draggedTicket = null;
        },
        error: (err) => {
          console.error('❌ Error completo:', err);
          console.error('❌ Error status:', err.status);
          console.error('❌ Error message:', err.message);
          console.error('❌ Error body:', err.error);
          
          // Comentado temporalmente para debug
          // alert('Error al cambiar el estado del ticket');
          
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
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      panelClass: 'dialog-fullscreen',
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