import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TicketsService } from '../../services/tickets.service';
import { Ticket, TicketFilters } from '../../models/ticket.model';
import { TicketFormComponent } from '../../components/ticket-form/ticket-form.component';
import { TicketEditDialogComponent } from '../../components/ticket-edit-dialog/ticket-edit-dialog.component';

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

  activeView: 'list' | 'cards' = 'cards';
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

  filtersForm = this.fb.group({
    search: [''],
    estado: [''],
    prioridad: [''],
    tipo: [''],
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  // === Cargar Tickets ===
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

  setView(view: 'list' | 'cards'): void {
    this.activeView = view;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadTickets();
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
