import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorPersona, PersonaBasic, RolPersonaProveedor, CreateProveedorPersonaDto, UpdateProveedorPersonaDto, getRolLabel, getRolColor, formatPersonaNombre, ROL_PERSONA_LABELS } from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedor-personas-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-personas-section.component.html',
  styleUrls: ['./proveedor-personas-section.component.css']
})
export class ProveedorPersonasSectionComponent implements OnInit {
  @Input() proveedorId!: number;
  @Input() personas: ProveedorPersona[] = [];
  @Output() personasChanged = new EventEmitter<void>();

  // Modal states
  showAddModal = false;
  showEditModal = false;
  selectedPersona: ProveedorPersona | null = null;

  // Form data
  formData: Partial<CreateProveedorPersonaDto> = {
    rol: 'titular',
    desde: new Date().toISOString().split('T')[0],
    es_principal: false
  };

  // Available options
  rolesDisponibles = Object.keys(ROL_PERSONA_LABELS) as RolPersonaProveedor[];
  personasDisponibles: PersonaBasic[] = [];

  loading = false;
  error: string | null = null;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.loadPersonas();
  }

  loadPersonas() {
    this.loading = true;
    this.proveedoresService.getPersonasVinculadas(this.proveedorId).subscribe({
      next: (personas) => {
        this.personas = personas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading personas:', err);
        this.error = 'Error al cargar personas vinculadas';
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.formData = {
      rol: 'titular',
      desde: new Date().toISOString().split('T')[0],
      es_principal: false
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.formData = {};
    this.error = null;
  }

  openEditModal(persona: ProveedorPersona) {
    this.selectedPersona = persona;
    this.formData = {
      rol: persona.rol,
      desde: persona.desde,
      hasta: persona.hasta || undefined,
      es_principal: persona.es_principal
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedPersona = null;
    this.formData = {};
    this.error = null;
  }

  onSubmitAdd() {
    if (!this.formData.persona_id || !this.formData.rol || !this.formData.desde) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    const dto: CreateProveedorPersonaDto = {
      proveedor_id: this.proveedorId,
      persona_id: this.formData.persona_id,
      rol: this.formData.rol,
      desde: this.formData.desde,
      hasta: this.formData.hasta,
      es_principal: this.formData.es_principal || false
    };

    this.loading = true;
    this.proveedoresService.vincularPersona(dto).subscribe({
      next: () => {
        this.loadPersonas();
        this.closeAddModal();
        this.personasChanged.emit();
      },
      error: (err) => {
        console.error('Error adding persona:', err);
        this.error = err.error?.message || 'Error al vincular persona';
        this.loading = false;
      }
    });
  }

  onSubmitEdit() {
    if (!this.selectedPersona) return;

    const dto: UpdateProveedorPersonaDto = {
      rol: this.formData.rol as RolPersonaProveedor,
      desde: this.formData.desde,
      hasta: this.formData.hasta,
      es_principal: this.formData.es_principal
    };

    this.loading = true;
    this.proveedoresService.updatePersonaVinculada(this.proveedorId, this.selectedPersona.id, dto).subscribe({
      next: () => {
        this.loadPersonas();
        this.closeEditModal();
        this.personasChanged.emit();
      },
      error: (err) => {
        console.error('Error updating persona:', err);
        this.error = err.error?.message || 'Error al actualizar persona';
        this.loading = false;
      }
    });
  }

  onDelete(persona: ProveedorPersona) {
    if (!confirm(`¿Está seguro de desvincular a ${this.getPersonaNombre(persona)}?`)) {
      return;
    }

    this.loading = true;
    this.proveedoresService.desvincularPersona(this.proveedorId, persona.id).subscribe({
      next: () => {
        this.loadPersonas();
        this.personasChanged.emit();
      },
      error: (err) => {
        console.error('Error deleting persona:', err);
        this.error = err.error?.message || 'Error al desvincular persona';
        this.loading = false;
      }
    });
  }

  onTogglePrincipal(persona: ProveedorPersona) {
    this.loading = true;
    this.proveedoresService.marcarPersonaPrincipal(this.proveedorId, persona.id).subscribe({
      next: () => {
        this.loadPersonas();
        this.personasChanged.emit();
      },
      error: (err) => {
        console.error('Error marking as principal:', err);
        this.error = err.error?.message || 'Error al marcar como principal';
        this.loading = false;
      }
    });
  }

  // Helper methods
  getPersonaNombre(personaVinculada: ProveedorPersona): string {
    if (personaVinculada.persona) {
      return formatPersonaNombre(personaVinculada.persona);
    }
    return 'Sin nombre';
  }

  getRolLabel(rol: RolPersonaProveedor): string {
    return getRolLabel(rol);
  }

  getRolColor(rol: RolPersonaProveedor): string {
    return getRolColor(rol);
  }

  getInitials(personaVinculada: ProveedorPersona): string {
    if (!personaVinculada.persona) return '??';
    const { nombre, apellido } = personaVinculada.persona;
    return `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-AR');
  }
}
