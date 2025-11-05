import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TicketsService } from '../../services/tickets.service';
import { Ticket, TicketState } from '../../models/ticket.model';

type ActionTab = 'estado' | 'asignacion' | 'costos' | 'comentario' | 'adjunto';

@Component({
  selector: 'app-ticket-actions-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="p-4 space-y-4">
      <h2 class="text-lg font-semibold">Acciones del ticket</h2>

      <!-- Tabs -->
      <div class="flex gap-2">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab"
                class="px-3 py-1 rounded-md border text-sm"
                [class.bg-blue-600]="activeTab === tab"
                [class.text-white]="activeTab === tab">
          {{ tab | titlecase }}
        </button>
      </div>

      <!-- Estado -->
      <form *ngIf="activeTab==='estado'" [formGroup]="estadoForm" (ngSubmit)="saveEstado()" class="space-y-3">
        <select class="w-full rounded-md border px-3 py-2 text-sm" formControlName="estado">
          <option *ngFor="let e of estados" [ngValue]="e">{{ e | titlecase }}</option>
        </select>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded-md border" (click)="close()">Cancelar</button>
          <button type="submit" class="px-3 py-2 rounded-md bg-blue-600 text-white" [disabled]="estadoForm.invalid">Guardar</button>
        </div>
      </form>

      <!-- Asignación -->
      <form *ngIf="activeTab==='asignacion'" [formGroup]="asignForm" (ngSubmit)="saveAsignacion()" class="space-y-3">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input formControlName="asignadoANombre" placeholder="Nombre responsable" class="rounded-md border px-3 py-2 text-sm" />
          <select formControlName="asignadoRol" class="rounded-md border px-3 py-2 text-sm">
            <option [ngValue]="null">Rol</option>
            <option value="proveedor">Proveedor</option>
            <option value="encargado">Encargado</option>
            <option value="admin_consorcio">Admin Consorcio</option>
            <option value="otro">Otro</option>
          </select>
          <input formControlName="proveedorId" type="number" placeholder="Proveedor ID (opcional)" class="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded-md border" (click)="close()">Cancelar</button>
          <button type="submit" class="px-3 py-2 rounded-md bg-blue-600 text-white">Guardar</button>
        </div>
      </form>

      <!-- Costos -->
      <form *ngIf="activeTab==='costos'" [formGroup]="costosForm" (ngSubmit)="saveCostos()" class="space-y-3">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input formControlName="estimacionCosto" type="number" step="0.01" placeholder="Estimación"
                 class="rounded-md border px-3 py-2 text-sm" />
          <input formControlName="costoFinal" type="number" step="0.01" placeholder="Costo final"
                 class="rounded-md border px-3 py-2 text-sm" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded-md border" (click)="close()">Cancelar</button>
          <button type="submit" class="px-3 py-2 rounded-md bg-blue-600 text-white">Guardar</button>
        </div>
      </form>

      <!-- Comentario -->
      <form *ngIf="activeTab==='comentario'" [formGroup]="comentForm" (ngSubmit)="saveComentario()" class="space-y-3">
        <textarea formControlName="message" rows="4" placeholder="Agregar comentario"
                  class="w-full rounded-md border px-3 py-2 text-sm"></textarea>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" formControlName="isInternal" /> Comentario interno
        </label>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded-md border" (click)="close()">Cancelar</button>
          <button type="submit" class="px-3 py-2 rounded-md bg-blue-600 text-white" [disabled]="comentForm.invalid">Guardar</button>
        </div>
      </form>

      <!-- Adjunto -->
      <div *ngIf="activeTab==='adjunto'" class="space-y-3">
        <input type="file" (change)="onFileSelect($event)" />
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 rounded-md border" (click)="close()">Cerrar</button>
        </div>
      </div>
    </div>
  `
})
export class TicketActionsDialogComponent implements OnInit {
  tabs: ActionTab[] = ['estado', 'asignacion', 'costos', 'comentario', 'adjunto'];
  activeTab: ActionTab;
  estados: TicketState[] = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];

  estadoForm!: FormGroup;
  asignForm!: FormGroup;
  costosForm!: FormGroup;
  comentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private dialogRef: MatDialogRef<TicketActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { ticket: Ticket; initialTab?: ActionTab; currentUserId?: number }
  ) {
    this.activeTab = data?.initialTab ?? 'estado';
  }

  ngOnInit(): void {
    this.estadoForm = this.fb.group({ estado: [this.data.ticket.estado, Validators.required] });
    this.asignForm = this.fb.group({
      asignadoANombre: [''],
      asignadoRol: [null],
      proveedorId: [null],
    });
    this.costosForm = this.fb.group({
      estimacionCosto: [null],
      costoFinal: [null],
    });
    this.comentForm = this.fb.group({
      message: ['', Validators.required],
      isInternal: [false],
    });
  }

  close() { this.dialogRef.close(false); }

  saveEstado() {
    const estado = this.estadoForm.value.estado!;
    this.ticketsService.updateTicketEstado(this.data.ticket.id, estado)
      .subscribe(() => this.dialogRef.close(true));
  }

  saveAsignacion() {
    const payload = this.asignForm.getRawValue();
    this.ticketsService.updateTicketAsignacion(this.data.ticket.id, {
      asignadoANombre: payload.asignadoANombre || null,
      asignadoRol: payload.asignadoRol || null,
      proveedorId: payload.proveedorId || null,
    }).subscribe(() => this.dialogRef.close(true));
  }

  saveCostos() {
    const payload = this.costosForm.getRawValue();
    this.ticketsService.updateTicketCostos(this.data.ticket.id, {
      estimacionCosto: payload.estimacionCosto ?? null,
      costoFinal: payload.costoFinal ?? null,
    }).subscribe(() => this.dialogRef.close(true));
  }

  saveComentario() {
    const { message, isInternal } = this.comentForm.getRawValue();
    const authorId = this.data.currentUserId ?? 0;
    this.ticketsService.addComentario({
      ticketId: this.data.ticket.id,
      authorId,
      message: message!,
      isInternal: !!isInternal,
    }).subscribe(() => this.dialogRef.close(true));
  }

  onFileSelect(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.ticketsService.uploadAdjunto(this.data.ticket.id, file)
      .subscribe(() => this.dialogRef.close(true));
  }
}
