import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import { CreateUnidadDto, UpdateUnidadDto, UnidadFuncional, EstadoUnidad } from '../../models/unidad.model';
import { Consorcio } from '../../../consorcios/models/consorcio.model';

/**
 * =========================================
 * UNIDAD FORM COMPONENT
 * =========================================
 * Componente para crear y editar unidades funcionales
 * ✅ ACTUALIZADO: Ahora carga consorcios reales desde el backend
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
  loadingConsorcios = false;
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

  // ✅ Consorcios reales desde el backend
  consorcios: Consorcio[] = [];

  constructor(
    private unidadesService: UnidadesService,
    private consorciosService: ConsorciosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Cargar consorcios primero
    this.loadConsorcios();

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
   * ✅ Cargar consorcios activos desde el backend
   */
  loadConsorcios(): void {
    this.loadingConsorcios = true;
    
    this.consorciosService.getConsorciosActivos({ 
      limit: 100, 
      sortBy: 'nombre', 
      sortOrder: 'asc' 
    }).subscribe({
      next: (response) => {
        this.consorcios = response.data;
        this.loadingConsorcios = false;
        
        // Si solo hay un consorcio, seleccionarlo automáticamente
        if (this.consorcios.length === 1 && !this.isEditMode) {
          this.unidad.consorcio_id = this.consorcios[0].id;
        }
      },
      error: (err) => {
        console.error('Error al cargar consorcios:', err);
        this.error = 'Error al cargar la lista de consorcios.';
        this.loadingConsorcios = false;
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
   * ✅ NUEVO: Validar superficie
   */
  validateSuperficie(): boolean {
    return this.unidad.superficie >= 0;
  }

  /**
   * ✅ NUEVO: Validar porcentaje de participación
   */
  validatePorcentaje(): boolean {
    const porcentaje = this.unidad.porcentaje_participacion;
    return porcentaje >= 0 && porcentaje <= 100;
  }

  /**
   * Enviar formulario
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Por favor, completa todos los campos obligatorios.';
      return;
    }

    // Validaciones adicionales
    if (!this.unidad.consorcio_id || this.unidad.consorcio_id === 0) {
      this.error = 'Debes seleccionar un consorcio.';
      return;
    }

    if (!this.validateSuperficie()) {
      this.error = 'La superficie no puede ser negativa.';
      return;
    }

    if (!this.validatePorcentaje()) {
      this.error = 'El porcentaje de participación debe estar entre 0 y 100.';
      return;
    }

    this.error = null;
    this.loading = true;

    if (this.isEditMode && this.unidadId) {
      this.updateUnidad();
    } else {
      this.createUnidad();
    }
  }

  /**
   * Crear nueva unidad
   */
  createUnidad(): void {
    const dto: CreateUnidadDto = {
      consorcio_id: this.unidad.consorcio_id,
      codigo: this.unidad.codigo.trim(),
      piso: this.unidad.piso.trim(),
      superficie: Number(this.unidad.superficie),
      porcentaje_participacion: Number(this.unidad.porcentaje_participacion),
      estado: this.unidad.estado
    };

    this.unidadesService.createUnidad(dto).subscribe({
      next: (response) => {
        this.successMessage = 'Unidad creada correctamente.';
        this.loading = false;
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/unidades']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al crear unidad:', err);
        this.error = err.error?.message || 'Error al crear la unidad. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Actualizar unidad existente
   */
  updateUnidad(): void {
    if (!this.unidadId) return;

    const dto: UpdateUnidadDto = {
      codigo: this.unidad.codigo.trim(),
      piso: this.unidad.piso.trim(),
      superficie: Number(this.unidad.superficie),
      porcentaje_participacion: Number(this.unidad.porcentaje_participacion),
      estado: this.unidad.estado
    };

    this.unidadesService.updateUnidad(this.unidadId, dto).subscribe({
      next: (response) => {
        this.successMessage = 'Unidad actualizada correctamente.';
        this.loading = false;
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/unidades']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al actualizar unidad:', err);
        this.error = err.error?.message || 'Error al actualizar la unidad. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Cancelar y volver
   */
  cancelar(): void {
    this.router.navigate(['/unidades']);
  }

  /**
   * Obtener nombre del consorcio por ID
   */
  getNombreConsorcio(id: number): string {
    const consorcio = this.consorcios.find(c => c.id === id);
    return consorcio ? consorcio.nombre : 'Consorcio desconocido';
  }
}