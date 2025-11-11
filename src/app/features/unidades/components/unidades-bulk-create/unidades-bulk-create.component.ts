import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UnidadesService } from '../../services/unidades.service';
import { ConsorciosService } from '../../../consorcios/services/consorcios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unidades-bulk-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
     <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Creación Masiva de Unidades Funcionales</h3>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-4">
        
        <!-- Selector de Consorcio (solo si no viene consorcioId) -->
        <div *ngIf="!consorcioId">
          <label class="block text-sm font-medium text-gray-700 mb-1">Consorcio *</label>
          <select formControlName="consorcio_id" 
            (change)="onConsorcioChange()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccione un consorcio</option>
            <option *ngFor="let c of consorcios" [value]="c.id">
              {{ c.nombre }} ({{ c.codigo_ext }})
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Seleccione el consorcio donde crear las unidades</p>
          
          <!-- ⭐ AGREGAR ESTE BLOQUE -->
          <div *ngIf="form.value.consorcio_id && unidadesExistentes >= 0" 
            class="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Unidades existentes:</span> {{ unidadesExistentes }}
            </p>
          </div>
        </div>

        <!-- Info del consorcio (si viene consorcioId) -->
        <div *ngIf="consorcioId && consorcioNombre" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-sm text-blue-800">
            <span class="font-medium">Consorcio:</span> {{ consorcioNombre }}
          </p>
          <p *ngIf="unidadesExistentes > 0" class="text-xs text-blue-600 mt-1">
            Ya tiene {{ unidadesExistentes }} unidades creadas
          </p>
        </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad de UF *</label>
            <input type="number" formControlName="cantidad" min="1" max="500" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <p class="text-xs text-gray-500 mt-1">Máximo 500 unidades</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prefijo *</label>
            <input type="text" formControlName="prefijo" placeholder="UF, DPTO, OF" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <p class="text-xs text-gray-500 mt-1">Ej: UF-001, DPTO-001</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select formControlName="tipo" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="departamento">Departamento</option>
              <option value="oficina">Oficina</option>
              <option value="cochera">Cochera</option>
              <option value="local">Local Comercial</option>
              <option value="deposito">Depósito</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado inicial</label>
            <select formControlName="estado" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="vacante">Vacante</option>
              <option value="ocupado">Ocupado</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <!-- Preview -->
          <div *ngIf="form.valid" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800 font-medium mb-2">Vista previa:</p>
            <p class="text-xs text-blue-700">
              Se crearán {{ form.value.cantidad }} unidades: 
              <span class="font-mono">{{ form.value.prefijo }}-001</span> hasta 
              <span class="font-mono">{{ form.value.prefijo }}-{{ formatNumber(form.value.cantidad) }}</span>
            </p>
          </div>

          <div class="flex gap-2 justify-end pt-4 border-t">
            <button type="button" (click)="onCancel()" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="form.invalid || loading" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ loading ? 'Creando...' : 'Crear Unidades' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class UnidadesBulkCreateComponent implements OnInit {
  @Input() consorcioId?: number; // Opcional: si viene, se usa directamente
  @Input() consorcioNombre?: string; // Opcional: nombre del consorcio
  @Output() close = new EventEmitter<boolean>();
  
  form!: FormGroup;
  loading = false;
  consorcios: any[] = [];
  unidadesExistentes = 0;

  constructor(
    private fb: FormBuilder,
    private unidadesService: UnidadesService,
    private consorciosService: ConsorciosService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      consorcio_id: [this.consorcioId || '', Validators.required],
      cantidad: [10, [Validators.required, Validators.min(1), Validators.max(500)]],
      prefijo: ['UF', [Validators.required, Validators.maxLength(10)]],
      tipo: ['departamento', Validators.required],
      estado: ['vacante', Validators.required]
    });

    // Si no viene consorcioId, cargar lista de consorcios
    if (!this.consorcioId) {
      this.loadConsorcios();
    } else {
      this.loadUnidadesExistentes(this.consorcioId);
    }
  }

  loadConsorcios() {
    this.consorciosService.getConsorcios({ limit: 1000 }).subscribe({
      next: (response: any) => {
        this.consorcios = response.data || response;
      },
      error: (err) => {
        console.error('Error cargando consorcios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los consorcios',
          confirmButtonColor: '#dc2626'
        });
      }
    });
  }

  onConsorcioChange() {
    const consorcioId = this.form.value.consorcio_id;
    if (consorcioId) {
      this.loadUnidadesExistentes(consorcioId);
    }
  }

loadUnidadesExistentes(consorcioId: number) {
  console.log('🔍 Cargando unidades para consorcio:', consorcioId);
  this.unidadesService.getUnidadesByConsorcio(consorcioId).subscribe({
    next: (unidades: any) => {
      console.log('📦 Unidades recibidas:', unidades);
      this.unidadesExistentes = Array.isArray(unidades) ? unidades.length : 0;
      console.log('✅ Total unidades:', this.unidadesExistentes);
    },
    error: (err) => {
      console.error('❌ Error:', err);
      this.unidadesExistentes = 0;
    }
  });
}

  formatNumber(num: number): string {
    return num.toString().padStart(3, '0');
  }

  onSubmit() {
    if (this.form.invalid) return;

    const data = this.form.value;
    
    // Validación: Si ya existen unidades, advertir
    if (this.unidadesExistentes > 0) {
      Swal.fire({
        title: '¿Continuar?',
        html: `Este consorcio ya tiene <strong>${this.unidadesExistentes} unidades</strong>.<br>¿Desea agregar ${data.cantidad} unidades más?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ejecutarCreacion(data);
        }
      });
    } else {
      this.ejecutarCreacion(data);
    }
  }

  ejecutarCreacion(data: any) {
    this.loading = true;

    this.unidadesService.bulkCreate(data).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `${response.creadas} unidades creadas correctamente`,
          confirmButtonColor: '#2563eb'
        });
        this.close.emit(true);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error bulk create:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error creando unidades',
          confirmButtonColor: '#dc2626'
        });
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.close.emit(false);
  }
}