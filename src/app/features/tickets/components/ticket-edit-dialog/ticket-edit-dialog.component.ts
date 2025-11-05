import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Ticket } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';

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

  // Formularios tipados
  estadoForm!: FormGroup;
  asignForm!: FormGroup;
  comentarioForm!: FormGroup;
  costoForm!: FormGroup;

  estados = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket }
  ) {}

  ngOnInit(): void {
    this.ticket = this.data.ticket;
    this.initForms();
    this.loadHistorial();
  }

  /**
   * Inicializar todos los formularios
   */
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

  /**
   * Cargar historial del ticket
   */
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

  /**
   * Getters para filtrar historial por tipo
   */
  get comentariosHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'comentario');
  }

  get estadosHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'estado');
  }

  get adjuntosHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'adjunto');
  }

  get costosHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'costos');
  }

  get asignacionesHistorial(): any[] {
    return (this.historial || []).filter((x) => x.tipo === 'asignado');
  }

  /**
   * Cerrar modal
   */
  close(): void {
    this.dialogRef.close(false);
  }

  /**
   * Formatear fecha
   */
  formatDate(value?: string): string {
    if (!value) return 'N/D';
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  /**
   * Guardar cambio de estado
   */
  saveEstado(): void {
    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      return;
    }

    const nuevoEstado = this.estadoForm.value.estado!;
    
    this.ticketsService.updateTicketEstado(this.ticket.id, nuevoEstado).subscribe({
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

  /**
   * Guardar asignación
   */
  saveAsignacion(): void {
    const payload = this.asignForm.getRawValue();
    
    this.ticketsService.updateTicketAsignacion(this.ticket.id, payload).subscribe({
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

  /**
   * Guardar comentario
   */
  saveComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    const payload = this.comentarioForm.getRawValue();
    
    this.ticketsService
      .addComentario({
        ticketId: this.ticket.id,
        authorId: 0, // TODO: reemplazar por usuario logueado
        message: payload.mensaje!,
        isInternal: !!payload.interno,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Comentario agregado:', response);
          this.comentarioForm.reset({ interno: false });
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al agregar comentario:', err);
          alert('Error al agregar el comentario');
        },
      });
  }

  /**
   * Guardar costos
   */
  saveCostos(): void {
    if (this.costoForm.invalid) {
      this.costoForm.markAllAsTouched();
      return;
    }

    const payload = this.costoForm.getRawValue();
    
    this.ticketsService
      .updateTicketCostos(this.ticket.id, {
        estimacionCosto: payload.estimado,
        costoFinal: payload.final,
      })
      .subscribe({
        next: (ticketActualizado) => {
          console.log('✅ Costos actualizados:', ticketActualizado);
          this.ticket.estimacionCosto = payload.estimado;
          this.ticket.costoFinal = payload.final;
          this.loadHistorial();
        },
        error: (err) => {
          console.error('❌ Error al actualizar costos:', err);
          alert('Error al actualizar los costos');
        },
      });
  }

  /**
   * Subir archivo adjunto
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validar tamaño (máx 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      input.value = '';
      return;
    }

    this.ticketsService.uploadAdjunto(this.ticket.id, file).subscribe({
      next: (response) => {
        console.log('✅ Archivo subido:', response);
        this.loadHistorial();
        input.value = ''; // Limpiar input
      },
      error: (err) => {
        console.error('❌ Error al subir archivo:', err);
        alert('Error al subir el archivo');
        input.value = '';
      },
    });
  }
}