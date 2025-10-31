import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TicketsService } from '../../services/tickets.service';
import { TicketPriority, TicketType } from '../../models/ticket.model';
import { ModalHeaderComponent } from '../../../../core/modal-header/modal-header.component';


@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ModalHeaderComponent
],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent {
  form: FormGroup;
  isSubmitting = false;

  consorcios: any[] = [];
  unidades: any[] = [];
  prioridades: TicketPriority[] = [];
  tipos: TicketType[] = [];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private dialogRef: MatDialogRef<TicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { consorcioId?: number; unidadId?: number }
  ) {
    this.form = this.fb.group({
      consorcioId: [data.consorcioId ?? null, Validators.required],
      unidadId: [data.unidadId ?? null],
      tipo: ['mantenimiento', Validators.required],
      prioridad: ['media', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.prioridades = this.ticketsService.getPrioridades();
    this.tipos = this.ticketsService.getTipos();

    if (!this.data.consorcioId) {
      this.ticketsService.getConsorcios().subscribe(c => (this.consorcios = c));
    }
    if (!this.data.unidadId) {
      this.ticketsService.getUnidades().subscribe(u => (this.unidades = u));
    }
  }

  /** =============================
   *  SUBMIT FORMULARIO
   * ============================= */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      consorcio_id: this.form.value.consorcioId,
      unidad_id: this.form.value.unidadId,
      tipo: this.form.value.tipo,
      prioridad: this.form.value.prioridad,
      titulo: this.form.value.titulo,
      descripcion: this.form.value.descripcion,
      creado_por: 1 // ⚠️ reemplazar por el ID real del usuario logueado
    };

    this.ticketsService
      .createTicket(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: ticket => {
          console.log('✅ Ticket creado:', ticket);
          this.dialogRef.close(ticket); // cierra modal y devuelve ticket
        },
        error: err => {
          console.error('❌ Error al crear ticket:', err);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
