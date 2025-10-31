import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ConsorciosImportService } from '../../services/consorcios-import.service';

type PreviewRow = Record<string, any>;

interface TargetField {
  field: string;
  label: string;
  required: boolean;
}

@Component({
  selector: 'app-consorcios-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consorcios-upload.component.html',
})
export class ConsorciosUploadComponent {
  // Campos destino (expuestos al template)
  readonly fields: TargetField[] = [
    { field: 'codigo_ext', label: 'Codigo Externo', required: false },
    { field: 'nombre', label: 'Nombre (obligatorio)', required: true },
    { field: 'direccion', label: 'Dirección', required: false },
    { field: 'ciudad', label: 'Ciudad', required: false },
    { field: 'provincia', label: 'Provincia', required: false },
    { field: 'pais', label: 'País', required: false },
    { field: 'cuit', label: 'CUIT', required: false },
    { field: 'telefono_contacto', label: 'Teléfono', required: false },
    { field: 'email_contacto', label: 'Email', required: false },
    { field: 'responsable_id', label: 'Responsable ID', required: false },
    { field: 'tenant_id', label: 'Tenant ID', required: false },
  ];

  file = signal<File | null>(null);
  excelColumns = signal<string[]>([]);
  rows = signal<PreviewRow[]>([]);
  loading = signal(false);

  mappingForm = new FormGroup(
    this.fields.reduce((acc, f) => {
      acc[f.field] = new FormControl<string | null>(
        null,
        f.required ? Validators.required : []
      );
      return acc;
    }, {} as Record<string, FormControl<string | null>>)
  );

  missingRequired = computed(() => {
    const nombreCtrl = this.mappingForm.get('nombre');
    return !!nombreCtrl && !nombreCtrl.value;
  });

  constructor(
    private importService: ConsorciosImportService,
    private router: Router
  ) {}

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const f = input.files?.[0] || null;
    this.file.set(f);

    if (!f) {
      this.excelColumns.set([]);
      this.rows.set([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: PreviewRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!json.length) {
          Swal.fire('Archivo vacío', 'El archivo no tiene filas.', 'warning');
          this.excelColumns.set([]);
          this.rows.set([]);
          return;
        }

        const cols = Object.keys(json[0]);
        this.excelColumns.set(cols);
        this.rows.set(json.slice(0, 20));
        this.autosuggestMapping(cols);
      } catch (e: any) {
        console.error(e);
        Swal.fire('Error', 'No se pudo leer el Excel. Verifica el formato.', 'error');
      }
    };
    reader.readAsArrayBuffer(f);
  }

  private autosuggestMapping(cols: string[]) {
    const norm = (s: string) => s.trim().toLowerCase();
    const byName = (hint: string) => cols.find(c => norm(c) === norm(hint));
    const byIncludes = (hint: string) => cols.find(c => norm(c).includes(norm(hint)));

    const suggestions: Record<string, string | null> = {
      codigo_ext: byName('codigo_ext') ?? null,
      nombre: byName('nombre') ?? byIncludes('nombre') ?? null,
      direccion: byIncludes('dire') ?? null,
      ciudad: byName('ciudad') ?? byIncludes('ciu') ?? null,
      provincia: byName('provincia') ?? byIncludes('prov') ?? null,
      pais: byName('pais') ?? null,
      cuit: byName('cuit') ?? byIncludes('c.u.i.t') ?? null,
      telefono_contacto: byIncludes('tel') ?? byIncludes('phone') ?? null,
      email_contacto: byIncludes('mail') ?? byIncludes('email') ?? null,
      responsable_id: byIncludes('responsable') ?? byIncludes('usuario') ?? null,
      tenant_id: byIncludes('tenant') ?? byIncludes('tenant_id') ?? null,
    };

    Object.entries(suggestions).forEach(([field, col]) => {
      const ctrl = this.mappingForm.get(field);
      if (ctrl && col) ctrl.setValue(col);
    });
  }

  submit() {
    if (!this.file()) {
      Swal.fire('Atención', 'Subí un archivo primero.', 'info');
      return;
    }

    if (this.mappingForm.invalid) {
      Swal.fire('Campos requeridos', 'Completá los campos obligatorios (al menos Nombre).', 'warning');
      this.mappingForm.markAllAsTouched();
      return;
    }

    // Nuevo formato: { columnaExcel: [campoBD1, campoBD2, ...] }
    const mapping: Record<string, string[]> = {};

    for (const field of Object.keys(this.mappingForm.controls)) {
      const col = this.mappingForm.get(field)?.value;
      if (col) {
        if (!mapping[col]) mapping[col] = [];
        mapping[col].push(field);
      }
    }

    this.loading.set(true);

    this.importService.uploadExcel(this.file()!, mapping).subscribe({
      next: (resp) => {
        this.loading.set(false);
        Swal.fire({
          title: '✅ Importación completa',
          text: resp?.message ?? 'Los consorcios se importaron correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/consorcios']);
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Error al importar.';
        Swal.fire({
          title: '❌ Error en la importación',
          text: msg,
          icon: 'error',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#dc2626',
          heightAuto: false
        });
      }
    });
  }
}
