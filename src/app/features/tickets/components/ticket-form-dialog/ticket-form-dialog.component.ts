import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TicketsService } from '../../services/tickets.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import { UnidadesService } from '../../../unidades/services/unidades.service';

@Component({
  selector: 'app-ticket-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-form-dialog.component.html',
  styleUrls: ['./ticket-form-dialog.component.scss']
})
export class TicketFormDialogComponent implements OnInit, OnChanges {
  @Input() consorcio_id?: number;
  @Input() consorcio_nombre?: string;
  @Input() unidad_funcional_id?: number;
  @Input() unidad_funcional_nombre?: string;

  form!: FormGroup;
  consorcios: any[] = [];
  unidades: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private consorciosService: ConsorciosService,
    private unidadesService: UnidadesService,
    private toastr: ToastrService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      consorcio_id: [this.consorcio_id ?? null, Validators.required],
      unidad_funcional_id: [this.unidad_funcional_id ?? null, Validators.required],
      titulo: ['', Validators.required],
      descripcion: [''],
      prioridad: ['media', Validators.required],
    });

    // Si no viene consorcio preasignado, cargamos lista de consorcios
    if (!this.consorcio_id) {
      this.consorciosService.getConsorcios({ limit: 100 }).subscribe((res: any) => {
        this.consorcios = res.data || res;
      });
    } else {
      // Si viene consorcio, cargamos sus unidades
      this.cargarUnidades(this.consorcio_id);
    }
  }

  ngOnChanges(): void {
    if (this.form) {
      if (this.consorcio_id) {
        this.form.patchValue({ consorcio_id: this.consorcio_id });
        this.cargarUnidades(this.consorcio_id);
      }
      if (this.unidad_funcional_id) {
        this.form.patchValue({ unidad_funcional_id: this.unidad_funcional_id });
      }
    }
  }

  cargarUnidades(consorcioId: number): void {
    this.unidadesService.getUnidades({ consorcio_id: consorcioId }).subscribe((res: any) => {
      this.unidades = res.data || res;
    });
  }

  getConsorcioNombre(): string {
    if (this.consorcio_nombre) return this.consorcio_nombre;
    const c = this.consorcios.find((x: any) => x.id === this.consorcio_id);
    return c ? (c.codigo_ext ? `${c.nombre} (${c.codigo_ext})` : c.nombre) : `ID ${this.consorcio_id}`;
  }

  getUnidadNombre(): string {
    if (this.unidad_funcional_nombre) return this.unidad_funcional_nombre;
    const u = this.unidades.find((x: any) => x.id === this.unidad_funcional_id);
    return u ? u.codigo || u.nombre || `UF ${u.id}` : `UF ${this.unidad_funcional_id}`;
  }

  onClose(): void {
    const backdrop = document.querySelector('.modal-overlay') || document.querySelector('.modal-backdrop');
    (backdrop as HTMLElement)?.remove();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value;

    this.ticketsService.createTicket(data).subscribe({
      next: () => {
        this.toastr.success('Ticket creado correctamente', 'Éxito');
        this.onClose();
      },
      error: (err) => {
        console.error('Error al crear ticket:', err);
        this.toastr.error('Ocurrió un error al crear el ticket', 'Error');
      },
    });
  }
}
