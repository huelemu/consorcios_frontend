import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorPersona, RolPersonaProveedor, CreateProveedorPersonaDto, UpdateProveedorPersonaDto, getRolLabel, getRolColor, formatPersonaNombre, ROL_PERSONA_LABELS } from '../../models/proveedor.model';
import { ProveedoresService } from '../../services/proveedores.service';
import { PersonasService } from '../../../personas/services/personas.service';
import { Persona, PersonaInput } from '../../../personas/models/persona.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-proveedor-personas-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedor-personas-section.component.html',
  styleUrls: ['./proveedor-personas-section.component.css']
})
export class ProveedorPersonasSectionComponent implements OnInit, OnDestroy {
  @Input() proveedorId!: number;
  @Input() personas: ProveedorPersona[] = [];
  @Output() personasChanged = new EventEmitter<void>();

  // Modal states
  showAddModal = false;
  showEditModal = false;
  showCreatePersonaModal = false;
  selectedPersona: ProveedorPersona | null = null;

  // Form data
  formData: Partial<CreateProveedorPersonaDto> = {
    rol: 'titular',
    desde: new Date().toISOString().split('T')[0],
    es_principal: false
  };

  // Persona creation form
  newPersonaForm: PersonaInput = {
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    localidad: '',
    provincia: '',
    tipo_persona: 'fisica'
  };

  // Search
  searchTerm = '';
  searchResults: Persona[] = [];
  searchLoading = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Available options
  rolesDisponibles = Object.keys(ROL_PERSONA_LABELS) as RolPersonaProveedor[];

  loading = false;
  error: string | null = null;

  constructor(
    private proveedoresService: ProveedoresService,
    private personasService: PersonasService
  ) {}

  ngOnInit() {
    this.loadPersonas();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(term => {
        if (!term || term.length < 2) {
          this.searchResults = [];
          return [];
        }
        this.searchLoading = true;
        return this.personasService.searchPersonas(term);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searchLoading = false;
      },
      error: (err) => {
        console.error('Error searching personas:', err);
        this.searchLoading = false;
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  selectPersona(persona: Persona) {
    this.formData.persona_id = persona.id;
    this.searchTerm = this.personasService.getFullName(persona);
    this.searchResults = [];
  }

  clearSearch() {
    this.searchTerm = '';
    this.formData.persona_id = undefined;
    this.searchResults = [];
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
    this.searchTerm = '';
    this.searchResults = [];
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.formData = {};
    this.error = null;
    this.clearSearch();
  }

  openCreatePersonaModal() {
    this.newPersonaForm = {
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
      localidad: '',
      provincia: '',
      tipo_persona: 'fisica'
    };
    this.showCreatePersonaModal = true;
  }

  closeCreatePersonaModal() {
    this.showCreatePersonaModal = false;
    this.newPersonaForm = {
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
      localidad: '',
      provincia: '',
      tipo_persona: 'fisica'
    };
  }

  onCreatePersona() {
    if (!this.newPersonaForm.nombre || !this.newPersonaForm.apellido) {
      this.error = 'Nombre y apellido son requeridos';
      return;
    }

    this.loading = true;
    this.personasService.createPersona(this.newPersonaForm).subscribe({
      next: (response) => {
        const persona = response.data;
        this.selectPersona(persona);
        this.closeCreatePersonaModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating persona:', err);
        this.error = err.error?.message || 'Error al crear persona';
        this.loading = false;
      }
    });
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
