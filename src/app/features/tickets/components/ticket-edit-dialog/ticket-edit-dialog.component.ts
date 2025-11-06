import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Ticket } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-ticket-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.scss'],
})
export class TicketEditDialogComponent implements OnInit {
  ticket!: Ticket;
  historial: any[] = [];
  ticketForm!: FormGroup;
  estados = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];
  selectedFile: File | null = null;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket }
  ) {}

  ngOnInit(): void {
    this.ticket = this.data.ticket;
    this.initForm();
    this.loadHistorial();
  }

  private initForm(): void {
    this.ticketForm = this.fb.group({
      estado: [this.ticket.estado, Validators.required],
      asignadoANombre: [this.ticket.asignadoANombre || ''],
      asignadoRol: [this.ticket.asignadoRol || null],
      proveedorId: [this.ticket.proveedorId || null],
      estimacionCosto: [this.ticket.estimacionCosto || null, [Validators.min(0)]],
      costoFinal: [this.ticket.costoFinal || null, [Validators.min(0)]],
      comentario: ['', [Validators.required, Validators.minLength(5)]],
      comentarioInterno: [false]
    });
  }

  loadHistorial(): void {
    this.ticketsService.getTicketHistorial(this.ticket.id).subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.historial = [];
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  save(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      alert('Completá todos los campos obligatorios, incluido el comentario.');
      return;
    }

    this.saving = true;
    const form = this.ticketForm.value;
    const updates: Promise<any>[] = [];

    // 1. Actualizar Estado (si cambió)
    if (form.estado !== this.ticket.estado) {
      updates.push(
        this.ticketsService.updateTicketEstado(this.ticket.id, form.estado).toPromise()
      );
    }

    // 2. Actualizar Asignación (si cambió)
    if (
      form.asignadoANombre !== this.ticket.asignadoANombre ||
      form.asignadoRol !== this.ticket.asignadoRol ||
      form.proveedorId !== this.ticket.proveedorId
    ) {
      updates.push(
        this.ticketsService.updateTicketAsignacion(this.ticket.id, {
          asignadoANombre: form.asignadoANombre,
          asignadoRol: form.asignadoRol,
          proveedorId: form.proveedorId
        }).toPromise()
      );
    }

    // 3. Actualizar Costos (si cambió)
    if (
      form.estimacionCosto !== this.ticket.estimacionCosto ||
      form.costoFinal !== this.ticket.costoFinal
    ) {
      updates.push(
        this.ticketsService.updateTicketCostos(this.ticket.id, {
          estimacionCosto: form.estimacionCosto,
          costoFinal: form.costoFinal
        }).toPromise()
      );
    }

    // 4. Subir archivo (si existe)
    if (this.selectedFile) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      updates.push(
        this.ticketsService.uploadAdjunto(this.ticket.id, this.selectedFile, user?.id || 1).toPromise()
      );
    }

    // 5. SIEMPRE agregar comentario
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    updates.push(
      this.ticketsService.addComentario({
        ticketId: this.ticket.id,
        authorId: user?.id || 1,
        authorName: user?.username || 'Usuario',
        mensaje: form.comentario,
        isInternal: form.comentarioInterno
      }).toPromise()
    );

    // Ejecutar todas las actualizaciones
    Promise.all(updates)
      .then(() => {
        this.saving = false;
        this.dialogRef.close(true);
      })
      .catch((err) => {
        this.saving = false;
        console.error('Error al guardar:', err);
        alert('Error al guardar los cambios');
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }
}