import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Ticket } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../../../auth/auth.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { ProveedoresService } from '../../../proveedores/services/proveedores.service';
import { PersonasService } from '../../../personas/services/personas.service';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Proveedor } from '../../../proveedores/models/proveedor.model';
import { Persona } from '../../../personas/models/persona.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

type TipoAsignacion = 'sin_asignar' | 'encargado' | 'proveedor' | 'persona';

@Component({
  selector: 'app-ticket-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './ticket-edit-dialog.component.html',
  styleUrls: ['./ticket-edit-dialog.component.scss'],
})
export class TicketEditDialogComponent implements OnInit, OnDestroy {
  ticket!: Ticket;
  historial: any[] = [];
  ticketForm!: FormGroup;
  estados = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];
  selectedFile: File | null = null;
  saving = false;

  // Control de asignación
  tipoAsignacion: TipoAsignacion = 'sin_asignar';

  // Opciones de tipo de asignación
  tiposAsignacion = [
    { value: 'sin_asignar', label: 'Sin asignar', icon: '🚫' },
    { value: 'encargado', label: 'Encargado de edificio', icon: '👷' },
    { value: 'proveedor', label: 'Proveedor', icon: '🔧' },
    { value: 'persona', label: 'Persona/Usuario', icon: '👤' }
  ];

  // Búsqueda de encargados
  encargadosEncontrados: Usuario[] = [];
  encargadoSearchSubject = new Subject<string>();
  encargadoSearchTerm = '';
  encargadoSeleccionado: Usuario | null = null;
  mostrarResultadosEncargados = false;

  // Búsqueda de personas/usuarios
  personasEncontradas: (Usuario | Persona)[] = [];
  personaSearchSubject = new Subject<string>();
  personaSearchTerm = '';
  personaSeleccionada: Usuario | Persona | null = null;
  mostrarResultadosPersonas = false;

  // Búsqueda de proveedores
  proveedoresEncontrados: Proveedor[] = [];
  proveedorSearchSubject = new Subject<string>();
  proveedorSearchTerm = '';
  proveedorSeleccionado: Proveedor | null = null;
  mostrarResultadosProveedores = false;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private proveedoresService: ProveedoresService,
    private personasService: PersonasService,
    private dialogRef: MatDialogRef<TicketEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket }
  ) {}

  ngOnInit(): void {
    this.ticket = this.data.ticket;
    this.determinarTipoAsignacion();
    this.initForm();
    this.loadHistorial();
    this.setupSearchListeners();
  }

  private determinarTipoAsignacion(): void {
    if (this.ticket.proveedorId) {
      this.tipoAsignacion = 'proveedor';
      // Cargar el proveedor si existe
      this.proveedoresService.getProveedorById(this.ticket.proveedorId).subscribe({
        next: (proveedor) => {
          this.proveedorSeleccionado = proveedor;
          this.proveedorSearchTerm = proveedor.razon_social;
        },
        error: (err) => console.error('Error cargando proveedor:', err)
      });
    } else if (this.ticket.asignadoAId || this.ticket.asignadoANombre) {
      // Determinar si es encargado o persona genérica
      if (this.ticket.asignadoRol === 'encargado' || this.ticket.asignadoRol === 'admin_edificio') {
        this.tipoAsignacion = 'encargado';
        this.encargadoSearchTerm = this.ticket.asignadoANombre || '';
      } else {
        this.tipoAsignacion = 'persona';
        this.personaSearchTerm = this.ticket.asignadoANombre || '';
      }
    } else {
      this.tipoAsignacion = 'sin_asignar';
    }
  }

  private initForm(): void {
    this.ticketForm = this.fb.group({
      estado: [this.ticket.estado, Validators.required],
      asignadoANombre: [this.ticket.asignadoANombre || ''],
      asignadoRol: [this.ticket.asignadoRol || null],
      proveedorId: [this.ticket.proveedorId || null],
      estimacionCosto: [this.ticket.estimacionCosto || null, [Validators.min(0)]],
      costoFinal: [this.ticket.costoFinal || null, [Validators.min(0)]],
      comentario: ['', [Validators.required, Validators.minLength(5)]],
      comentarioInterno: [false]
    });
  }

  private setupSearchListeners(): void {
    // Búsqueda de encargados con debounce
    const encargadoSub = this.encargadoSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return [];
        }
        // Buscar usuarios activos
        return this.usuariosService.getUsuarios({ search: term, activo: true, limit: 10 });
      })
    ).subscribe({
      next: (response) => {
        this.encargadosEncontrados = response.usuarios || [];
        this.mostrarResultadosEncargados = this.encargadosEncontrados.length > 0;
      },
      error: (err) => console.error('Error buscando encargados:', err)
    });

    // Búsqueda de personas con debounce
    const personaSub = this.personaSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return [];
        }
        // Buscar en usuarios y personas
        return this.usuariosService.buscarUsuarios(term);
      })
    ).subscribe({
      next: (resultados) => {
        this.personasEncontradas = resultados;
        this.mostrarResultadosPersonas = resultados.length > 0;
      },
      error: (err) => console.error('Error buscando personas:', err)
    });

    // Búsqueda de proveedores con debounce
    const proveedorSub = this.proveedorSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return [];
        }
        return this.proveedoresService.getProveedores({ search: term, limit: 10 });
      })
    ).subscribe({
      next: (response) => {
        this.proveedoresEncontrados = response.data || [];
        this.mostrarResultadosProveedores = this.proveedoresEncontrados.length > 0;
      },
      error: (err) => console.error('Error buscando proveedores:', err)
    });

    this.subscriptions.add(encargadoSub);
    this.subscriptions.add(personaSub);
    this.subscriptions.add(proveedorSub);
  }

  loadHistorial(): void {
    this.ticketsService.getTicketHistorial(this.ticket.id).subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.historial = [];
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  // Métodos de asignación
  onTipoAsignacionChange(event: Event): void {
    const tipo = (event.target as HTMLSelectElement).value as TipoAsignacion;
    this.tipoAsignacion = tipo;

    // Limpiar valores al cambiar
    this.encargadoSeleccionado = null;
    this.personaSeleccionada = null;
    this.proveedorSeleccionado = null;
    this.encargadoSearchTerm = '';
    this.personaSearchTerm = '';
    this.proveedorSearchTerm = '';
    this.encargadosEncontrados = [];
    this.personasEncontradas = [];
    this.proveedoresEncontrados = [];
    this.mostrarResultadosEncargados = false;
    this.mostrarResultadosPersonas = false;
    this.mostrarResultadosProveedores = false;

    // Resetear campos del formulario
    this.ticketForm.patchValue({
      asignadoANombre: '',
      asignadoRol: null,
      proveedorId: null
    });

    // Cargar lista inicial según el tipo seleccionado
    if (tipo === 'encargado') {
      this.cargarEncargadosIniciales();
    } else if (tipo === 'proveedor') {
      this.cargarProveedoresIniciales();
    } else if (tipo === 'persona') {
      this.cargarPersonasIniciales();
    }
  }

  // Cargar listas iniciales
  cargarEncargadosIniciales(): void {
    // Buscar usuarios sin filtro de rol específico (mostrar todos los usuarios disponibles)
    this.usuariosService.getUsuarios({ limit: 15, activo: true }).subscribe({
      next: (response) => {
        this.encargadosEncontrados = response.usuarios || [];
        this.mostrarResultadosEncargados = true;
      },
      error: (err) => console.error('Error cargando encargados:', err)
    });
  }

  cargarProveedoresIniciales(): void {
    this.proveedoresService.getProveedores({ limit: 15, activo: true }).subscribe({
      next: (response) => {
        this.proveedoresEncontrados = response.data || [];
        this.mostrarResultadosProveedores = true;
      },
      error: (err) => console.error('Error cargando proveedores:', err)
    });
  }

  cargarPersonasIniciales(): void {
    this.usuariosService.getUsuarios({ limit: 15 }).subscribe({
      next: (response) => {
        this.personasEncontradas = response.usuarios || [];
        this.mostrarResultadosPersonas = true;
      },
      error: (err) => console.error('Error cargando personas:', err)
    });
  }

  onEncargadoSearchInput(term: string): void {
    this.encargadoSearchTerm = term;
    if (term.length >= 2) {
      this.encargadoSearchSubject.next(term);
    } else if (term.length === 0) {
      // Si borra todo, volver a cargar lista inicial
      this.cargarEncargadosIniciales();
    } else {
      // Si tiene 1 carácter, mantener la lista visible pero no buscar
      this.mostrarResultadosEncargados = this.encargadosEncontrados.length > 0;
    }
  }

  seleccionarEncargado(encargado: Usuario): void {
    this.encargadoSeleccionado = encargado;
    const nombreCompleto = encargado.persona
      ? `${encargado.persona.nombre} ${encargado.persona.apellido}`
      : encargado.username || '';
    this.encargadoSearchTerm = nombreCompleto;
    this.mostrarResultadosEncargados = false;
  }

  onPersonaSearchInput(term: string): void {
    this.personaSearchTerm = term;
    if (term.length >= 2) {
      this.personaSearchSubject.next(term);
    } else if (term.length === 0) {
      // Si borra todo, volver a cargar lista inicial
      this.cargarPersonasIniciales();
    } else {
      // Si tiene 1 carácter, mantener la lista visible pero no buscar
      this.mostrarResultadosPersonas = this.personasEncontradas.length > 0;
    }
  }

  seleccionarPersona(persona: Usuario | Persona): void {
    this.personaSeleccionada = persona;

    // Determinar el nombre según el tipo
    let nombreCompleto = '';
    if ('username' in persona && persona.persona) {
      // Es un Usuario
      nombreCompleto = `${persona.persona.nombre} ${persona.persona.apellido}`;
    } else if ('nombre' in persona) {
      // Es una Persona
      nombreCompleto = `${persona.nombre} ${persona.apellido || ''}`.trim();
    }

    this.personaSearchTerm = nombreCompleto;
    this.mostrarResultadosPersonas = false;
  }

  onProveedorSearchInput(term: string): void {
    this.proveedorSearchTerm = term;
    if (term.length >= 2) {
      this.proveedorSearchSubject.next(term);
    } else if (term.length === 0) {
      // Si borra todo, volver a cargar lista inicial
      this.cargarProveedoresIniciales();
    } else {
      // Si tiene 1 carácter, mantener la lista visible pero no buscar
      this.mostrarResultadosProveedores = this.proveedoresEncontrados.length > 0;
    }
  }

  seleccionarProveedor(proveedor: Proveedor): void {
    this.proveedorSeleccionado = proveedor;
    this.proveedorSearchTerm = proveedor.razon_social;
    this.mostrarResultadosProveedores = false;
  }

  getPersonaNombre(persona: Usuario | Persona): string {
    if ('username' in persona && persona.persona) {
      return `${persona.persona.nombre} ${persona.persona.apellido}`;
    } else if ('nombre' in persona) {
      return `${persona.nombre} ${persona.apellido || ''}`.trim();
    }
    return '';
  }

  getPersonaEmail(persona: Usuario | Persona): string {
    // Verificar si es un Usuario (tiene username)
    if ('username' in persona) {
      const usuario = persona as Usuario;
      return usuario.email || '';
    }
    // Es una Persona
    const personaObj = persona as Persona;
    return personaObj.email || '';
  }

  save(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      alert('Completá todos los campos obligatorios, incluido el comentario.');
      return;
    }

    this.saving = true;
    const form = this.ticketForm.value;
    const updates: Promise<any>[] = [];

    // 1. Actualizar Estado (si cambió)
    if (form.estado !== this.ticket.estado) {
      updates.push(
        this.ticketsService.updateTicketEstado(this.ticket.id, form.estado).toPromise()
      );
    }

    // 2. Actualizar Asignación (según el tipo seleccionado)
    const asignacionData: any = {};
    let asignacionCambio = false;

    if (this.tipoAsignacion === 'sin_asignar') {
      // Limpiar asignación
      if (this.ticket.asignadoAId || this.ticket.proveedorId) {
        asignacionData.asignadoAId = null;
        asignacionData.asignadoANombre = null;
        asignacionData.asignadoRol = null;
        asignacionData.proveedorId = null;
        asignacionCambio = true;
      }
    } else if (this.tipoAsignacion === 'encargado') {
      // Asignar a encargado
      const encargadoId = this.encargadoSeleccionado?.id;
      const encargadoNombre = this.encargadoSearchTerm.trim();

      if (
        encargadoNombre !== this.ticket.asignadoANombre ||
        this.ticket.asignadoRol !== 'encargado' ||
        this.ticket.proveedorId
      ) {
        asignacionData.asignadoAId = encargadoId || null;
        asignacionData.asignadoANombre = encargadoNombre;
        asignacionData.asignadoRol = 'encargado';
        asignacionData.proveedorId = null;
        asignacionCambio = true;
      }
    } else if (this.tipoAsignacion === 'persona') {
      // Asignar a persona genérica
      const personaId = this.personaSeleccionada?.id;
      const personaNombre = this.personaSearchTerm.trim();

      if (
        personaNombre !== this.ticket.asignadoANombre ||
        this.ticket.asignadoRol === 'encargado' ||
        this.ticket.proveedorId
      ) {
        asignacionData.asignadoAId = personaId || null;
        asignacionData.asignadoANombre = personaNombre;
        asignacionData.asignadoRol = 'otro';
        asignacionData.proveedorId = null;
        asignacionCambio = true;
      }
    } else if (this.tipoAsignacion === 'proveedor') {
      // Asignar a proveedor
      const proveedorId = this.proveedorSeleccionado?.id;

      if (proveedorId !== this.ticket.proveedorId || this.ticket.asignadoAId) {
        asignacionData.proveedorId = proveedorId;
        asignacionData.asignadoAId = null;
        asignacionData.asignadoANombre = null;
        asignacionData.asignadoRol = 'proveedor';
        asignacionCambio = true;
      }
    }

    if (asignacionCambio) {
      updates.push(
        this.ticketsService.updateTicketAsignacion(this.ticket.id, asignacionData).toPromise()
      );
    }

    // 3. Actualizar Costos (si cambió)
    if (
      form.estimacionCosto !== this.ticket.estimacionCosto ||
      form.costoFinal !== this.ticket.costoFinal
    ) {
      updates.push(
        this.ticketsService.updateTicketCostos(this.ticket.id, {
          estimacionCosto: form.estimacionCosto,
          costoFinal: form.costoFinal
        }).toPromise()
      );
    }

    // 4. Subir archivo (si existe)
    if (this.selectedFile) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      updates.push(
        this.ticketsService.uploadAdjunto(this.ticket.id, this.selectedFile, user?.id || 1).toPromise()
      );
    }

    // 5. SIEMPRE agregar comentario
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    updates.push(
      this.ticketsService.addComentario({
        ticketId: this.ticket.id,
        authorId: user?.id || 1,
        authorName: user?.username || 'Usuario',
        mensaje: form.comentario,
        isInternal: form.comentarioInterno
      }).toPromise()
    );

    // Ejecutar todas las actualizaciones
    Promise.all(updates)
      .then(() => {
        this.saving = false;
        this.dialogRef.close(true);
      })
      .catch((err) => {
        this.saving = false;
        console.error('Error al guardar:', err);
        alert('Error al guardar los cambios');
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}