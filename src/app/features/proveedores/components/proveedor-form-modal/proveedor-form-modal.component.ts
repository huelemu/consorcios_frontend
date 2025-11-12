import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Proveedor,
  CreateProveedorDto,
  UpdateProveedorDto,
  TipoEntidad,
  CondicionIVA,
  RUBROS_COMUNES,
  CONDICION_IVA_LABELS,
  formatCUIT,
  validarCUIT
} from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedor-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-form-modal.component.html',
  styleUrls: ['./proveedor-form-modal.component.css']
})
export class ProveedorFormModalComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() proveedor: Proveedor | null = null;  // Si es null, es crear; si tiene valor, es editar
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<Proveedor>();

  // Form data
  formData: Partial<CreateProveedorDto> = {
    tipo_entidad: 'juridica',
    activo: true
  };

  // Available options
  rubrosDisponibles = RUBROS_COMUNES;
  tiposEntidad: TipoEntidad[] = ['fisica', 'juridica'];
  condicionesIVA = Object.keys(CONDICION_IVA_LABELS) as CondicionIVA[];

  loading = false;
  error: string | null = null;
  cuitError: string | null = null;

  // Sections visibility
  showAdvanced = false;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🟢 Modal ngOnChanges:', changes);
    console.log('🟢 show value:', this.show);
    if (changes['proveedor'] && this.proveedor) {
      this.loadProveedorData();
    } else if (changes['show'] && this.show && !this.proveedor) {
      this.resetForm();
    }
  }

  initForm() {
    if (this.proveedor) {
      this.loadProveedorData();
    } else {
      this.resetForm();
    }
  }

  loadProveedorData() {
    if (!this.proveedor) return;

    this.formData = {
      razon_social: this.proveedor.razon_social,
      tipo_entidad: this.proveedor.tipo_entidad,
      cuit: this.proveedor.cuit,
      rubro: this.proveedor.rubro,
      email_general: this.proveedor.email_general,
      telefono: this.proveedor.telefono,
      domicilio: this.proveedor.domicilio,
      localidad: this.proveedor.localidad,
      provincia: this.proveedor.provincia,
      cod_postal: this.proveedor.cod_postal,
      condicion_iva: this.proveedor.condicion_iva,
      observaciones: this.proveedor.observaciones,
      activo: this.proveedor.activo
    };
  }

  resetForm() {
    this.formData = {
      tipo_entidad: 'juridica',
      activo: true
    };
    this.error = null;
    this.cuitError = null;
    this.showAdvanced = false;
  }

  validateCUIT() {
    if (this.formData.cuit) {
      const isValid = validarCUIT(this.formData.cuit);
      this.cuitError = isValid ? null : 'CUIT inválido (formato: XX-XXXXXXXX-X)';
    } else {
      this.cuitError = null;
    }
  }

  formatCuitDisplay() {
    if (this.formData.cuit) {
      this.formData.cuit = formatCUIT(this.formData.cuit);
    }
  }

  onSubmit() {
    // Validaciones
    if (!this.formData.razon_social || !this.formData.cuit || !this.formData.rubro) {
      this.error = 'Por favor complete todos los campos obligatorios';
      return;
    }

    if (!validarCUIT(this.formData.cuit)) {
      this.cuitError = 'CUIT inválido';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.proveedor) {
      // Editar
      const dto: UpdateProveedorDto = {
        razon_social: this.formData.razon_social,
        tipo_entidad: this.formData.tipo_entidad,
        cuit: this.formData.cuit,
        rubro: this.formData.rubro,
        email_general: this.formData.email_general,
        telefono: this.formData.telefono,
        domicilio: this.formData.domicilio,
        localidad: this.formData.localidad,
        provincia: this.formData.provincia,
        cod_postal: this.formData.cod_postal,
        condicion_iva: this.formData.condicion_iva,
        observaciones: this.formData.observaciones,
        activo: this.formData.activo
      };

      this.proveedoresService.updateProveedor(this.proveedor.id, dto).subscribe({
        next: (proveedor) => {
          this.loading = false;
          this.success.emit(proveedor);
          this.onClose();
        },
        error: (err) => {
          console.error('Error updating proveedor:', err);
          this.error = err.error?.message || 'Error al actualizar el proveedor';
          this.loading = false;
        }
      });
    } else {
      // Crear
      const dto: CreateProveedorDto = {
        razon_social: this.formData.razon_social!,
        tipo_entidad: this.formData.tipo_entidad!,
        cuit: this.formData.cuit!,
        rubro: this.formData.rubro!,
        email_general: this.formData.email_general,
        telefono: this.formData.telefono,
        domicilio: this.formData.domicilio,
        localidad: this.formData.localidad,
        provincia: this.formData.provincia,
        cod_postal: this.formData.cod_postal,
        condicion_iva: this.formData.condicion_iva,
        observaciones: this.formData.observaciones,
        activo: this.formData.activo !== false
      };

      this.proveedoresService.createProveedor(dto).subscribe({
        next: (proveedor) => {
          this.loading = false;
          this.success.emit(proveedor);
          this.onClose();
        },
        error: (err) => {
          console.error('Error creating proveedor:', err);
          this.error = err.error?.message || 'Error al crear el proveedor';
          this.loading = false;
        }
      });
    }
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  getCondicionIVALabel(condicion: CondicionIVA): string {
    return CONDICION_IVA_LABELS[condicion] || condicion;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  get isEditMode(): boolean {
    return !!this.proveedor;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor';
  }
}
