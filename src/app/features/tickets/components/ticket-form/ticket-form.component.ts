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
    prioridad: 'media',
    titulo: '',
    descripcion: '',
    creado_por: 0
  };

  tiposDisponibles = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reclamo', label: 'Reclamo' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'mejora', label: 'Mejora' },
    { value: 'otro', label: 'Otro' }
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
    @Inject(MAT_DIALOG_DATA) public data: { userId?: number; consorcioId?: number; unidadId?: number }
  ) {}

  ngOnInit(): void {
    console.log('🔍 Datos recibidos en ticket-form:', this.data);
    console.log('🔍 userId recibido:', this.data?.userId);

    this.ticket.creado_por = this.data?.userId || 1;
    console.log('✅ ticket.creado_por asignado:', this.ticket.creado_por);

    // Si viene consorcioId y unidadId desde el padre
    if (this.data?.consorcioId) {
      this.ticket.consorcio_id = this.data.consorcioId;
      this.loadUnidades(this.data.consorcioId);
    }
    if (this.data?.unidadId) {
      this.ticket.unidad_id = this.data.unidadId;
    }

    this.loadConsorcios();
  }

  private loadConsorcios(): void {
    this.consorciosService.getConsorcios({ limit: 100 }).subscribe({
      next: (res: any) => {
        this.consorcios = Array.isArray(res) ? res : (res?.data || []);
      },
      error: () => {
        this.error = 'No se pudo cargar la lista de consorcios.';
      }
    });
  }

  onConsorcioChange(): void {
    const id = this.ticket.consorcio_id;
    if (!id || id === 0) {
      this.unidades = [];
      this.ticket.unidad_id = 0;
      return;
    }
    this.loadUnidades(id);
  }

  private loadUnidades(consorcioId: number): void {
    // Pasar limit alto para traer todas las unidades del consorcio
    this.unidadesService.getUnidades({ limit: 500, consorcio_id: consorcioId }).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        
        // Filtrar por consorcio_id (el campo correcto según el log)
        this.unidades = list.filter((u: any) => 
          Number(u.consorcio_id) === Number(consorcioId)
        );
        
        console.log(`✅ ${this.unidades.length} unidades cargadas para consorcio ${consorcioId}`);
      },
      error: () => {
        this.error = 'No se pudieron cargar las unidades.';
      }
    });
  }

  onSubmit(form: NgForm): void {
    console.log('📤 Formulario enviado:', this.ticket);
    console.log('📋 Form válido:', form.valid);
    console.log('📋 Form values:', form.value);
    
    if (form.invalid) {
      this.error = 'Por favor, completá todos los campos obligatorios.';
      return;
    }
    if (!this.ticket.consorcio_id || this.ticket.consorcio_id === 0) {
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
      consorcio_id: Number(this.ticket.consorcio_id),
      unidad_id: this.ticket.unidad_id && this.ticket.unidad_id !== 0 ? Number(this.ticket.unidad_id) : null,
      tipo: this.ticket.tipo,
      prioridad: this.ticket.prioridad,
      titulo: this.ticket.titulo.trim(),
      descripcion: this.ticket.descripcion.trim(),
      creado_por: Number(this.ticket.creado_por)
    };

    console.log('📦 DTO a enviar:', dto);

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
        console.error('❌ Error completo:', err);
        this.error = err?.error?.message || 'Error al crear el ticket.';
      }
    });
  }

  openEdit(ticket: any): void {
    this.saved.emit(ticket);
    this.dialogRef.close(true);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}