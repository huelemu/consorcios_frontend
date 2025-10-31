import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonasService } from '../../../personas/services/personas.service';
import { ModalService } from '../../../../core/services/modal.service';
import { PersonaFormDialogComponent } from '../../../personas/components/persona-form-dialog/persona-form-dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConsorciosService } from '../../services/consorcios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


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

  constructor(
    private fb: FormBuilder,
    private personasService: PersonasService,
    private modalService: ModalService,
    private consorciosService: ConsorciosService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      codigo_ext: [''],
      ciudad: [''],
      provincia: [''],
      responsable_id: [null]
    });

    this.cargarResponsables();
  }

  cargarResponsables() {
  this.personasService.getPersonas({ limit: 100 }).subscribe((res: any) => {
    this.responsables = res.data; // porque la API devuelve { data: Persona[], pagination: ... }
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
    return;
  }

  const consorcioData = this.form.value;

  this.consorciosService.createConsorcio(consorcioData).subscribe({
    next: (res: any) => {
      // Mostrar toast
      this.toastr.success('Consorcio creado correctamente', 'Éxito');
      const consorcioId = res?.data?.id;
      // Cerrar el modal
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
      console.error('Error al guardar el consorcio:', err);
      this.toastr.error('Ocurrió un error al guardar el consorcio', 'Error');
    },
  });
}
}
