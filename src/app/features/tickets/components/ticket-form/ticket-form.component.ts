import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TicketsService, TicketConsorcioOption, TicketUnidadOption } from '../../services/tickets.service';
import { TicketPriority, TicketType } from '../../models/ticket.model';
import { AuthService } from '../../../../auth/auth.service';

export interface TicketFormData {
  consorcioId?: number;
  consorcioNombre?: string;
  unidadId?: number;
  unidadNombre?: string;
}

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  consorcios: TicketConsorcioOption[] = [];
  unidades: TicketUnidadOption[] = [];
  prioridades: TicketPriority[] = [];
  tipos: TicketType[] = [];

  consorcioNombre: string | null = null;
  unidadNombre: string | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TicketFormData
  ) {
    this.form = this.fb.group({
      consorcioId: [data.consorcioId ?? null, Validators.required],
      unidadId: [data.unidadId ?? null],
      tipo: ['mantenimiento', Validators.required],
      prioridad: ['media', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.consorcioNombre = data.consorcioNombre || null;
    this.unidadNombre = data.unidadNombre || null;
  }

  ngOnInit(): void {
    this.prioridades = this.ticketsService.getPrioridades();
    this.tipos = this.ticketsService.getTipos();

    if (!this.data.consorcioId) {
      this.loadConsorcios();
    } else {
      this.loadUnidades(this.data.consorcioId);
    }

    if (!this.data.unidadId && this.data.consorcioId) {
      this.loadUnidades(this.data.consorcioId);
    }
  }

  private loadConsorcios(): void {
    this.ticketsService.getConsorcios().subscribe({
      next: consorcios => {
        this.consorcios = consorcios;
      },
      error: err => {
        console.error('Error al cargar consorcios:', err);
        this.errorMessage = 'No se pudieron cargar los consorcios disponibles';
      }
    });
  }

  private loadUnidades(consorcioId: number): void {
    this.ticketsService.getUnidades().subscribe({
      next: unidades => {
        this.unidades = unidades.filter(u => u.consorcioId === consorcioId);
      },
      error: err => {
        console.error('Error al cargar unidades:', err);
        this.errorMessage = 'No se pudieron cargar las unidades disponibles';
      }
    });
  }

  onConsorcioChange(): void {
    const consorcioId = this.form.get('consorcioId')?.value;
    if (consorcioId) {
      this.form.patchValue({ unidadId: null });
      this.loadUnidades(consorcioId);
    } else {
      this.unidades = [];
    }
  }

  getTipoLabel(tipo: TicketType): string {
    const labels: Record<TicketType, string> = {
      mantenimiento: '🔧 Mantenimiento',
      reclamo: '⚠️ Reclamo',
      limpieza: '🧹 Limpieza',
      administrativo: '📋 Administrativo',
      mejora: '✨ Mejora',
      otro: '📌 Otro'
    };
    return labels[tipo] || tipo;
  }

  getPrioridadLabel(prioridad: TicketPriority): string {
    const labels: Record<TicketPriority, string> = {
      baja: '🟢 Baja',
      media: '🟡 Media',
      alta: '🟠 Alta',
      critica: '🔴 Crítica'
    };
    return labels[prioridad] || prioridad;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const user = this.authService.getCurrentUser();
    const userId = user?.id || 1;

    const payload = {
      consorcio_id: this.form.value.consorcioId,
      unidad_id: this.form.value.unidadId,
      tipo: this.form.value.tipo,
      prioridad: this.form.value.prioridad,
      titulo: this.form.value.titulo,
      descripcion: this.form.value.descripcion,
      creado_por: userId
    };

    this.ticketsService
      .createTicket(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: ticket => {
          console.log('✅ Ticket creado:', ticket);
          this.dialogRef.close(ticket);
        },
        error: err => {
          console.error('❌ Error al crear ticket:', err);
          this.errorMessage = err.error?.message || 'Ocurrió un error al crear el ticket. Por favor, intentá nuevamente.';
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
