// ticket-edit-dialog.component.ts - REEMPLAZAR TODO EL ARCHIVO

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
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

  estadoForm!: FormGroup;
  asignForm!: FormGroup;
  comentarioForm!: FormGroup;
  costoForm!: FormGroup;

  estados = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket }
  ) {}

  ngOnInit(): void {
    this.ticket = this.data.ticket;
    this.initForms();
    this.loadHistorial();
  }

  private initForms(): void {
    this.estadoForm = this.fb.group({
      estado: [this.ticket.estado, Validators.required],
    });

    this.asignForm = this.fb.group({
      asignadoANombre: [this.ticket.asignadoANombre || ''],
      asignadoRol: [this.ticket.asignadoRol || null],
      proveedorId: [this.ticket.proveedorId || null],
    });

    this.comentarioForm = this.fb.group({
      mensaje: ['', [Validators.required, Validators.minLength(3)]],
      interno: [false],
    });

    this.costoForm = this.fb.group({
      estimado: [this.ticket.estimacionCosto || null, [Validators.min(0)]],
      final: [this.ticket.costoFinal || null, [Validators.min(0)]],
    });
  }

  loadHistorial(): void {
    this.ticketsService.getTicketHistorial(this.ticket.id).subscribe({
      next: (data) => {
        this.historial = data;
        console.log('✅ Historial cargado:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar historial:', err);
        this.historial = [];
      },
    });
  }

  get comentariosHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'comentario');
  }

  close(): void {
    this.dialogRef.close(false);
  }

  formatDate(value?: string): string {
    if (!value) return 'N/D';
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  saveEstado(): void {
    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      return;
    }

    const nuevoEstado = this.estadoForm.value.estado!;
    
    this.ticketsService.updateTicketEstado(this.ticket.id, nuevoEstado)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (ticketActualizado) => {
          console.log('✅ Estado actualizado:', ticketActualizado);
          this.ticket.estado = nuevoEstado as any;
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al actualizar estado:', err);
          alert('Error al actualizar el estado del ticket');
        },
      });
  }

  saveAsignacion(): void {
    if (this.asignForm.invalid) {
      this.asignForm.markAllAsTouched();
      return;
    }

    const payload = this.asignForm.getRawValue();
    
    this.ticketsService.updateTicketAsignacion(this.ticket.id, payload)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (ticketActualizado) => {
          console.log('✅ Asignación actualizada:', ticketActualizado);
          this.ticket.asignadoANombre = payload.asignadoANombre;
          this.ticket.asignadoRol = payload.asignadoRol;
          this.ticket.proveedorId = payload.proveedorId;
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al actualizar asignación:', err);
          alert('Error al actualizar la asignación');
        },
      });
  }

  saveComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    const payload = this.comentarioForm.getRawValue();
    const currentUser = this.authService.getCurrentUser();
    const authorId = currentUser?.id || 1;
    
    this.ticketsService
      .addComentario({
        ticketId: this.ticket.id,
        authorId: authorId,
        message: payload.mensaje!,
        isInternal: !!payload.interno,
      })
      .pipe(finalize(() => {}))
      .subscribe({
        next: () => {
          console.log('✅ Comentario agregado');
          this.comentarioForm.reset();
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al agregar comentario:', err);
          alert('Error al agregar el comentario');
        },
      });
  }

  saveCostos(): void {
    if (this.costoForm.invalid) {
      this.costoForm.markAllAsTouched();
      return;
    }

    const payload = {
      estimacionCosto: this.costoForm.value.estimado,
      costoFinal: this.costoForm.value.final
    };
    
    this.ticketsService.updateTicketCostos(this.ticket.id, payload)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (ticketActualizado) => {
          console.log('✅ Costos actualizados:', ticketActualizado);
          this.ticket.estimacionCosto = payload.estimacionCosto;
          this.ticket.costoFinal = payload.costoFinal;
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al actualizar costos:', err);
          alert('Error al actualizar los costos');
        },
      });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.ticketsService.uploadAdjunto(this.ticket.id, file)
      .pipe(finalize(() => {}))
      .subscribe({
        next: () => {
          console.log('✅ Archivo subido');
          this.loadHistorial();
          input.value = '';
        },
        error: (err) => {
          console.error('❌ Error al subir archivo:', err);
          alert('Error al subir el archivo');
        },
      });
  }
}