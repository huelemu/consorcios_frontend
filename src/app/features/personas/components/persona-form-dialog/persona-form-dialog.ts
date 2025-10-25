import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Persona, PersonaInput } from '../../models/persona.model';
import { PersonasService } from '../../services/personas.service';

@Component({
  selector: 'app-persona-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persona-form-dialog.html',
  styleUrls: ['./persona-form-dialog.scss']
})
export class PersonaFormDialogComponent implements OnInit {
  @Input() persona: Persona | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  personaForm!: FormGroup;
  loading = false;
  error: string | null = null;
  isEditMode = false;

  // Opciones para selects
  tiposPersona = [
    { value: 'fisica', label: 'Persona Física' },
    { value: 'juridica', label: 'Persona Jurídica' }
  ];

  provincias = [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  constructor(
    private fb: FormBuilder,
    private personasService: PersonasService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.persona;
    this.initForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.personaForm = this.fb.group({
      nombre: [
        this.persona?.nombre || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      apellido: [
        this.persona?.apellido || '',
        [Validators.maxLength(100)]
      ],
      documento: [
        this.persona?.documento || '',
        [Validators.required, Validators.minLength(7), Validators.maxLength(20)]
      ],
      email: [
        this.persona?.email || '',
        [Validators.email, Validators.maxLength(150)]
      ],
      telefono: [
        this.persona?.telefono || '',
        [Validators.maxLength(50)]
      ],
      direccion: [
        this.persona?.direccion || '',
        [Validators.maxLength(150)]
      ],
      localidad: [
        this.persona?.localidad || '',
        [Validators.maxLength(100)]
      ],
      provincia: [
        this.persona?.provincia || 'Buenos Aires',
        [Validators.maxLength(100)]
      ],
      pais: [
        this.persona?.pais || 'Argentina',
        [Validators.maxLength(50)]
      ],
      tipo_persona: [
        this.persona?.tipo_persona || 'fisica',
        [Validators.required]
      ]
    });
  }

  /**
   * Obtiene el título del modal
   */
  getTitle(): string {
    return this.isEditMode ? 'Editar Persona' : 'Nueva Persona';
  }

  /**
   * Obtiene el texto del botón de guardar
   */
  getSaveButtonText(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear Persona';
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.personaForm.get(fieldName);
    
    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }

    return 'Campo inválido';
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.personaForm.controls).forEach(key => {
      this.personaForm.get(key)?.markAsTouched();
    });

    if (this.personaForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formData: PersonaInput = this.personaForm.value;

    const request = this.isEditMode && this.persona
      ? this.personasService.updatePersona(this.persona.id, formData)
      : this.personasService.createPersona(formData);

    request.subscribe({
      next: (response) => {
        console.log('Persona guardada:', response);
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error al guardar persona:', err);
        this.loading = false;
        
        // Manejar errores específicos del backend
        if (err.status === 409) {
          this.error = err.error.message || 'El documento o email ya existe';
        } else if (err.status === 400) {
          this.error = err.error.message || 'Datos inválidos';
        } else {
          this.error = 'Error al guardar la persona. Por favor intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Cierra el modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Maneja el click en el backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  /**
   * Maneja la tecla ESC para cerrar
   */
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }
}