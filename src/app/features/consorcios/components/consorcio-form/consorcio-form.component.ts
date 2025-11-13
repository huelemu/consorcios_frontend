import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonasService } from '../../../personas/services/personas.service';
import { ModalService } from '../../../../core/services/modal.service';
import { PersonaFormDialogComponent } from '../../../personas/components/persona-form-dialog/persona-form-dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConsorciosService } from '../../services/consorcios.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Consorcio, UpdateConsorcioDto, CreateConsorcioDto } from '../../models/consorcio.model';


@Component({
  selector: 'app-consorcio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './consorcio-form.component.html',
  styleUrls: ['./consorcio-form.component.scss']
})
export class ConsorcioFormComponent implements OnInit {
  form!: FormGroup;
  responsables: any[] = [];
  isEditMode = false;
  consorcioId: number | null = null;
  loading = false;
  loadingData = false;

  constructor(
    private fb: FormBuilder,
    private personasService: PersonasService,
    private modalService: ModalService,
    private consorciosService: ConsorciosService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      codigo_ext: [''],
      ciudad: [''],
      provincia: [''],
      responsable_id: [null],
      cuit: [''],
      telefono_contacto: [''],
      email_contacto: ['']
    });

    this.cargarResponsables();

    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.consorcioId = +params['id'];
        this.loadConsorcio();
      }
    });
  }

  cargarResponsables() {
    this.personasService.getPersonas({ limit: 100 }).subscribe((res: any) => {
      this.responsables = res.data; // porque la API devuelve { data: Persona[], pagination: ... }
    });
  }

  /**
   * Cargar datos del consorcio para edición
   */
  loadConsorcio(): void {
    if (!this.consorcioId) return;

    this.loadingData = true;
    this.consorciosService.getConsorcioById(this.consorcioId).subscribe({
      next: (consorcio: Consorcio) => {
        this.form.patchValue({
          nombre: consorcio.nombre,
          direccion: consorcio.direccion,
          codigo_ext: consorcio.codigo_ext,
          ciudad: consorcio.ciudad,
          provincia: consorcio.provincia,
          responsable_id: consorcio.responsable_id,
          cuit: consorcio.cuit,
          telefono_contacto: consorcio.telefono_contacto,
          email_contacto: consorcio.email_contacto
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error al cargar consorcio:', err);
        this.toastr.error('Error al cargar los datos del consorcio', 'Error');
        this.loadingData = false;
      }
    });
  }

  async crearResponsableNuevo() {
    const result = await this.modalService.open('Nueva Persona', PersonaFormDialogComponent, 'user');
    if (result === 'saved') this.cargarResponsables();
  }

  onClose(): void {
  // Si este form se usa en popup propio, simplemente ocultamos el modal:
  const backdrop = document.querySelector('.modal-backdrop');
  backdrop?.remove();
}

onBackdropClick(event: MouseEvent): void {
  if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
    this.onClose();
  }
}

onEscapeKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    this.onClose();
  }
}
onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Por favor completa todos los campos obligatorios', 'Validación');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.consorcioId) {
      this.updateConsorcio();
    } else {
      this.createConsorcio();
    }
  }

  /**
   * Crear nuevo consorcio
   */
  createConsorcio(): void {
    const consorcioData: CreateConsorcioDto = this.form.value;

    this.consorciosService.createConsorcio(consorcioData).subscribe({
      next: (res: any) => {
        this.toastr.success('Consorcio creado correctamente', 'Éxito');
        const consorcioId = res?.data?.id;
        this.loading = false;
        this.onClose();

        // Redirigir al detalle del consorcio
        setTimeout(() => {
          if (consorcioId) {
            this.router.navigate(['/consorcios', consorcioId]);
          } else {
            this.router.navigate(['/consorcios']);
          }
        }, 500);
      },
      error: (err) => {
        console.error('Error al crear el consorcio:', err);
        this.toastr.error(err.error?.message || 'Ocurrió un error al crear el consorcio', 'Error');
        this.loading = false;
      }
    });
  }

  /**
   * Actualizar consorcio existente
   */
  updateConsorcio(): void {
    if (!this.consorcioId) return;

    const consorcioData: UpdateConsorcioDto = this.form.value;

    this.consorciosService.updateConsorcio(this.consorcioId, consorcioData).subscribe({
      next: (res: any) => {
        this.toastr.success('Consorcio actualizado correctamente', 'Éxito');
        this.loading = false;
        this.onClose();

        // Redirigir al detalle del consorcio
        setTimeout(() => {
          this.router.navigate(['/consorcios', this.consorcioId]);
        }, 500);
      },
      error: (err) => {
        console.error('Error al actualizar el consorcio:', err);
        this.toastr.error(err.error?.message || 'Ocurrió un error al actualizar el consorcio', 'Error');
        this.loading = false;
      }
    });
  }
}
