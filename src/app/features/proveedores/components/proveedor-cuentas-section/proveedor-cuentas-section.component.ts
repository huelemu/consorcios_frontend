import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProveedorCuentaBancaria,
  TipoCuenta,
  TipoMoneda,
  CreateProveedorCuentaBancariaDto,
  UpdateProveedorCuentaBancariaDto,
  TIPO_CUENTA_LABELS,
  TIPO_MONEDA_LABELS,
  formatCBU,
  validarCBU
} from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedor-cuentas-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-cuentas-section.component.html',
  styleUrls: ['./proveedor-cuentas-section.component.css']
})
export class ProveedorCuentasSectionComponent implements OnInit {
  @Input() proveedorId!: number;
  @Input() cuentas: ProveedorCuentaBancaria[] = [];
  @Output() cuentasChanged = new EventEmitter<void>();

  // Modal states
  showAddModal = false;
  showEditModal = false;
  selectedCuenta: ProveedorCuentaBancaria | null = null;

  // Form data
  formData: Partial<CreateProveedorCuentaBancariaDto> = {
    tipo_cuenta: 'caja_ahorro',
    moneda: 'ARS',
    predeterminada: false,
    activa: true
  };

  // Available options
  tiposCuenta = Object.keys(TIPO_CUENTA_LABELS) as TipoCuenta[];
  tiposMoneda = Object.keys(TIPO_MONEDA_LABELS) as TipoMoneda[];

  loading = false;
  error: string | null = null;
  cbuError: string | null = null;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.loadCuentas();
  }

  loadCuentas() {
    this.loading = true;
    this.proveedoresService.getCuentasBancarias(this.proveedorId).subscribe({
      next: (cuentas) => {
        this.cuentas = cuentas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cuentas:', err);
        this.error = 'Error al cargar cuentas bancarias';
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.formData = {
      tipo_cuenta: 'caja_ahorro',
      moneda: 'ARS',
      predeterminada: false,
      activa: true
    };
    this.showAddModal = true;
    this.error = null;
    this.cbuError = null;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.formData = {};
    this.error = null;
    this.cbuError = null;
  }

  openEditModal(cuenta: ProveedorCuentaBancaria) {
    this.selectedCuenta = cuenta;
    this.formData = {
      banco: cuenta.banco,
      titular: cuenta.titular,
      cuit_titular: cuenta.cuit_titular,
      cbu: cuenta.cbu,
      alias: cuenta.alias,
      tipo_cuenta: cuenta.tipo_cuenta,
      moneda: cuenta.moneda,
      predeterminada: cuenta.predeterminada,
      activa: cuenta.activa
    };
    this.showEditModal = true;
    this.error = null;
    this.cbuError = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedCuenta = null;
    this.formData = {};
    this.error = null;
    this.cbuError = null;
  }

  validateCBU() {
    if (this.formData.cbu) {
      const isValid = validarCBU(this.formData.cbu);
      this.cbuError = isValid ? null : 'El CBU debe tener 22 dígitos';
    } else {
      this.cbuError = null;
    }
  }

  onSubmitAdd() {
    if (!this.formData.titular || !this.formData.cuit_titular || !this.formData.cbu) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (!validarCBU(this.formData.cbu)) {
      this.cbuError = 'El CBU debe tener 22 dígitos';
      return;
    }

    const dto: CreateProveedorCuentaBancariaDto = {
      proveedor_id: this.proveedorId,
      banco: this.formData.banco,
      titular: this.formData.titular,
      cuit_titular: this.formData.cuit_titular,
      cbu: this.formData.cbu,
      alias: this.formData.alias,
      tipo_cuenta: this.formData.tipo_cuenta,
      moneda: this.formData.moneda,
      predeterminada: this.formData.predeterminada || false,
      activa: this.formData.activa !== false
    };

    this.loading = true;
    this.proveedoresService.agregarCuentaBancaria(dto).subscribe({
      next: () => {
        this.loadCuentas();
        this.closeAddModal();
        this.cuentasChanged.emit();
      },
      error: (err) => {
        console.error('Error adding cuenta:', err);
        this.error = err.error?.message || 'Error al agregar cuenta bancaria';
        this.loading = false;
      }
    });
  }

  onSubmitEdit() {
    if (!this.selectedCuenta) return;

    if (!this.formData.titular || !this.formData.cuit_titular || !this.formData.cbu) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (!validarCBU(this.formData.cbu)) {
      this.cbuError = 'El CBU debe tener 22 dígitos';
      return;
    }

    const dto: UpdateProveedorCuentaBancariaDto = {
      banco: this.formData.banco,
      titular: this.formData.titular,
      cuit_titular: this.formData.cuit_titular,
      cbu: this.formData.cbu,
      alias: this.formData.alias,
      tipo_cuenta: this.formData.tipo_cuenta,
      moneda: this.formData.moneda,
      predeterminada: this.formData.predeterminada,
      activa: this.formData.activa
    };

    this.loading = true;
    this.proveedoresService.updateCuentaBancaria(this.proveedorId, this.selectedCuenta.id, dto).subscribe({
      next: () => {
        this.loadCuentas();
        this.closeEditModal();
        this.cuentasChanged.emit();
      },
      error: (err) => {
        console.error('Error updating cuenta:', err);
        this.error = err.error?.message || 'Error al actualizar cuenta bancaria';
        this.loading = false;
      }
    });
  }

  onDelete(cuenta: ProveedorCuentaBancaria) {
    if (!confirm(`¿Está seguro de eliminar la cuenta ${cuenta.alias || cuenta.cbu}?`)) {
      return;
    }

    this.loading = true;
    this.proveedoresService.deleteCuentaBancaria(this.proveedorId, cuenta.id).subscribe({
      next: () => {
        this.loadCuentas();
        this.cuentasChanged.emit();
      },
      error: (err) => {
        console.error('Error deleting cuenta:', err);
        this.error = err.error?.message || 'Error al eliminar cuenta bancaria';
        this.loading = false;
      }
    });
  }

  onTogglePredeterminada(cuenta: ProveedorCuentaBancaria) {
    this.loading = true;
    this.proveedoresService.marcarCuentaPredeterminada(this.proveedorId, cuenta.id).subscribe({
      next: () => {
        this.loadCuentas();
        this.cuentasChanged.emit();
      },
      error: (err) => {
        console.error('Error marking as predeterminada:', err);
        this.error = err.error?.message || 'Error al marcar como predeterminada';
        this.loading = false;
      }
    });
  }

  onToggleActiva(cuenta: ProveedorCuentaBancaria) {
    this.loading = true;
    this.proveedoresService.toggleCuentaActiva(this.proveedorId, cuenta.id).subscribe({
      next: () => {
        this.loadCuentas();
        this.cuentasChanged.emit();
      },
      error: (err) => {
        console.error('Error toggling activa:', err);
        this.error = err.error?.message || 'Error al cambiar estado de cuenta';
        this.loading = false;
      }
    });
  }

  // Helper methods
  formatCBU(cbu: string): string {
    return formatCBU(cbu);
  }

  getTipoCuentaLabel(tipo?: TipoCuenta): string {
    if (!tipo) return '-';
    return TIPO_CUENTA_LABELS[tipo] || tipo;
  }

  getMonedaLabel(moneda?: TipoMoneda): string {
    if (!moneda) return '-';
    return TIPO_MONEDA_LABELS[moneda] || moneda;
  }

  getMonedaSymbol(moneda?: TipoMoneda): string {
    if (moneda === 'USD') return '$';
    return '$';  // ARS también usa $
  }

  getCuentaPrincipalDisplay(cuenta: ProveedorCuentaBancaria): string {
    return cuenta.alias || this.formatCBU(cuenta.cbu);
  }
}
