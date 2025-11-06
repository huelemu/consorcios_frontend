import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketsService } from '../../services/tickets.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import { UnidadesService } from '../../../unidades/services/unidades.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  @Output() saved = new EventEmitter<any>();

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  consorcios: any[] = [];
  unidades: any[] = [];
  createdTicket: any = null;

  ticket: any = {
    consorcio_id: 0,
    unidad_id: 0,
    tipo: '',
    prioridad: '',
    titulo: '',
    descripcion: '',
    creado_por: 0
  };

  tiposDisponibles = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'otros', label: 'Otros' }
  ];

  prioridadesDisponibles = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  constructor(
    private ticketsService: TicketsService,
    private consorciosService: ConsorciosService,
    private unidadesService: UnidadesService,
    private dialogRef: MatDialogRef<TicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId?: number }
  ) {}

  ngOnInit(): void {
    // creado_por obligatorio
    this.ticket.creado_por = this.data?.userId || 1;
    this.loadConsorcios();
  }

  private loadConsorcios(): void {
    this.consorciosService.getConsorciosActivos({ limit: 100 }).subscribe({
      next: (res: any) => (this.consorcios = res?.data || []),
      error: () => (this.error = 'No se pudo cargar la lista de consorcios.')
    });
  }

  onConsorcioChange(): void {
    const id = this.ticket.consorcio_id;
    if (!id) {
      this.unidades = [];
      this.ticket.unidad_id = 0;
      return;
    }
    this.unidadesService.getUnidades().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        this.unidades = list.filter((u: any) => u.consorcioId === id);
      },
      error: () => (this.error = 'No se pudieron cargar las unidades.')
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Por favor, completá todos los campos obligatorios.';
      return;
    }
    if (!this.ticket.consorcio_id) {
      this.error = 'Debes seleccionar un consorcio.';
      return;
    }
    if (!this.ticket.creado_por) {
      this.error = 'Falta el ID del usuario creador.';
      return;
    }

    this.error = null;
    this.loading = true;

    const dto = {
      consorcio_id: this.ticket.consorcio_id,
      unidad_id: this.ticket.unidad_id || null,
      tipo: this.ticket.tipo,
      prioridad: this.ticket.prioridad,
      titulo: this.ticket.titulo.trim(),
      descripcion: this.ticket.descripcion.trim(),
      creado_por: this.ticket.creado_por
    };

    this.ticketsService.createTicket(dto).subscribe({
      next: (response) => {
        this.loading = false;
        const tk = response?.data || response;
        this.createdTicket = tk;
        this.successMessage = `Ticket #${tk.id} creado correctamente.`;

        // Autoabrir editor luego de 2s
        setTimeout(() => this.openEdit(tk), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear el ticket.';
      }
    });
  }

  // Abre editor en el padre y cierra el diálogo
  openEdit(ticket: any): void {
    this.saved.emit(ticket);
    this.dialogRef.close(true);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
