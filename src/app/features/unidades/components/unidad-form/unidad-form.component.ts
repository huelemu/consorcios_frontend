import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { CreateUnidadDto, UpdateUnidadDto, UnidadFuncional, EstadoUnidad } from '../../models/unidad.model';

/**
 * =========================================
 * UNIDAD FORM COMPONENT
 * =========================================
 * Componente para crear y editar unidades funcionales
 */
@Component({
  selector: 'app-unidad-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unidad-form.component.html',
  styleUrls: ['./unidad-form.component.scss']
})
export class UnidadFormComponent implements OnInit {
  isEditMode = false;
  unidadId: number | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Modelo del formulario
  unidad: any = {
    consorcio_id: 0,
    codigo: '',
    piso: '',
    superficie: 0,
    porcentaje_participacion: 0,
    estado: 'vacante'
  };

  // Opciones para selects
  estadosDisponibles: { value: EstadoUnidad; label: string }[] = [
    { value: 'ocupado', label: 'Ocupada' },
    { value: 'vacante', label: 'Vacante' },
    { value: 'mantenimiento', label: 'En Mantenimiento' }
  ];

  // Mock de consorcios (en producción vendría de un servicio)
  consorcios: any[] = [
    { id: 1, nombre: 'Edificio Libertad' },
    { id: 2, nombre: 'Torres del Parque' },
    { id: 3, nombre: 'Complejo Residencial Norte' }
  ];

  constructor(
    private unidadesService: UnidadesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.unidadId = +params['id'];
        this.loadUnidad();
      }
    });
  }

  /**
   * Cargar datos de la unidad para editar
   */
  loadUnidad(): void {
    if (!this.unidadId) return;

    this.loading = true;
    this.unidadesService.getUnidadById(this.unidadId).subscribe({
      next: (unidad: UnidadFuncional) => {
        this.unidad = {
          consorcio_id: unidad.consorcio_id,
          codigo: unidad.codigo,
          piso: unidad.piso,
          superficie: unidad.superficie,
          porcentaje_participacion: unidad.porcentaje_participacion,
          estado: unidad.estado
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar unidad:', err);
        this.error = 'Error al cargar los datos de la unidad.';
        this.loading = false;
      }
    });
  }

  /**
   * Enviar formulario
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    if (this.isEditMode && this.unidadId) {
      // Modo edición - excluir consorcio_id
      const updateDto: UpdateUnidadDto = {
        codigo: this.unidad.codigo,
        piso: this.unidad.piso,
        superficie: this.unidad.superficie,
        porcentaje_participacion: this.unidad.porcentaje_participacion,
        estado: this.unidad.estado
      };

      this.unidadesService.updateUnidad(this.unidadId, updateDto).subscribe({
        next: () => {
          this.successMessage = 'Unidad actualizada correctamente.';
          setTimeout(() => this.router.navigate(['/unidades']), 1500);
        },
        error: (err) => {
          console.error('Error al actualizar unidad:', err);
          this.error = 'Error al actualizar la unidad. Por favor, intenta nuevamente.';
          this.loading = false;
        }
      });
    } else {
      // Modo creación - incluir consorcio_id
      const createDto: CreateUnidadDto = {
        consorcio_id: this.unidad.consorcio_id,
        codigo: this.unidad.codigo,
        piso: this.unidad.piso,
        superficie: this.unidad.superficie,
        porcentaje_participacion: this.unidad.porcentaje_participacion,
        estado: this.unidad.estado
      };

      this.unidadesService.createUnidad(createDto).subscribe({
        next: () => {
          this.successMessage = 'Unidad creada correctamente.';
          setTimeout(() => this.router.navigate(['/unidades']), 1500);
        },
        error: (err) => {
          console.error('Error al crear unidad:', err);
          this.error = 'Error al crear la unidad. Por favor, intenta nuevamente.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Cancelar y volver al listado
   */
  cancelar(): void {
    this.router.navigate(['/unidades']);
  }

  /**
   * Validación personalizada: el porcentaje debe estar entre 0 y 100
   */
  validatePorcentaje(): boolean {
    return this.unidad.porcentaje_participacion! >= 0 && this.unidad.porcentaje_participacion! <= 100;
  }

  /**
   * Validación personalizada: la superficie debe ser positiva
   */
  validateSuperficie(): boolean {
    return this.unidad.superficie! > 0;
  }
}