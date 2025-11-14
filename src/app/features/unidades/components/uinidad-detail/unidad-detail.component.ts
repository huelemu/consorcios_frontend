import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { AuthService } from '../../../../auth/auth.service';
import {
  UnidadFuncional,
  ESTADO_UNIDAD_LABELS,
  ESTADO_UNIDAD_COLORS,
  ESTADO_UNIDAD_ICONS
} from '../../models/unidad.model';
import { Ticket } from '../../../tickets/models/ticket.model';
import { MatDialog } from '@angular/material/dialog';
import { TicketFormComponent } from '../../../tickets/components/ticket-form/ticket-form.component';

/**
 * =========================================
 * UNIDAD DETAIL COMPONENT
 * =========================================
 * Vista detallada de una unidad funcional con toda su información
 * y personas relacionadas
 */
@Component({
  selector: 'app-unidad-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unidad-detail.component.html',
  styleUrls: ['./unidad-detail.component.scss']
})
export class UnidadDetailComponent implements OnInit {
  unidad: UnidadFuncional | null = null;
  unidadId: number | null = null;
  loading = false;
  error: string | null = null;

  // Tickets
  tickets: Ticket[] = [];
  loadingTickets = false;

  // Permisos
  canEdit = false;
  canDelete = false;

  // Modales
  showDeleteModal = false;

  // Secciones colapsables
  collapsedSections: { [key: string]: boolean } = {
    tickets: false,     // Los tickets siempre visibles por defecto
    info: false,        // Información general visible
    consorcio: true,    // Consorcio colapsado por defecto
    personas: true      // Personas colapsado por defecto
  };

  // Constantes para el template
  readonly ESTADO_LABELS = ESTADO_UNIDAD_LABELS;
  readonly ESTADO_COLORS = ESTADO_UNIDAD_COLORS;
  readonly ESTADO_ICONS = ESTADO_UNIDAD_ICONS;

  constructor(
    private unidadesService: UnidadesService,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.getUnidadIdFromRoute();
    if (this.unidadId) {
      this.loadUnidad();
      this.loadTickets();
    }
  }

  /**
   * Verificar permisos del usuario
   */
  checkPermissions(): void {
    this.canEdit = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin', 
      'admin_consorcio',
      'admin_edificio'
    ]);

    this.canDelete = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin'
    ]);
  }

  /**
   * Obtener ID de la unidad desde la ruta
   */
  getUnidadIdFromRoute(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.unidadId = +params['id'];
      }
    });
  }

  /**
   * Cargar datos completos de la unidad
   */
  loadUnidad(): void {
    if (!this.unidadId) return;

    this.loading = true;
    this.error = null;

    this.unidadesService.getUnidadById(this.unidadId).subscribe({
      next: (unidad) => {
        this.unidad = unidad;
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
   * Navegar a editar
   */
  editarUnidad(): void {
    if (this.unidadId) {
      this.router.navigate(['/unidades', this.unidadId, 'editar']);
    }
  }

  /**
   * Mostrar modal de confirmación de eliminación
   */
  confirmarEliminar(): void {
    this.showDeleteModal = true;
  }

  /**
   * Cancelar eliminación
   */
  cancelarEliminar(): void {
    this.showDeleteModal = false;
  }

  /**
   * Eliminar unidad
   */
  eliminarUnidad(): void {
    if (!this.unidadId) return;

    this.loading = true;
    this.unidadesService.deleteUnidad(this.unidadId).subscribe({
      next: () => {
        this.router.navigate(['/unidades']);
      },
      error: (err) => {
        console.error('Error al eliminar unidad:', err);
        this.error = 'Error al eliminar la unidad. Por favor, intenta nuevamente.';
        this.loading = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Volver al listado
   */
  volver(): void {
    this.router.navigate(['/unidades']);
  }

  /**
   * Ver consorcio
   */
  verConsorcio(): void {
    if (this.unidad?.consorcio_id) {
      this.router.navigate(['/consorcios', this.unidad.consorcio_id]);
    }
  }

  /**
   * Ver persona
   */
  verPersona(personaId: number): void {
    this.router.navigate(['/personas', personaId]);
  }

  /**
   * Obtener clase de color según estado
   */
  getEstadoClass(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_COLORS[this.unidad.estado] || '';
  }

  /**
   * Obtener label del estado
   */
  getEstadoLabel(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_LABELS[this.unidad.estado] || '';
  }

  /**
   * Obtener icono del estado
   */
  getEstadoIcon(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_ICONS[this.unidad.estado] || '🏠';
  }

  /**
   * Obtener label del rol de persona
   */
  getRolLabel(rol: string): string {
    const roles: { [key: string]: string } = {
      propietario: 'Propietario',
      inquilino: 'Inquilino',
      responsable: 'Responsable',
      otro: 'Otro'
    };
    return roles[rol] || rol;
  }

  /**
   * Obtener clase de color para el rol
   * ✅ CORREGIDO: Uso de notación de corchetes para acceso seguro
   */
  getRolClass(rol: string): string {
    const classes: { [key: string]: string } = {
      propietario: 'bg-blue-100 text-blue-800 border-blue-200',
      inquilino: 'bg-green-100 text-green-800 border-green-200',
      responsable: 'bg-purple-100 text-purple-800 border-purple-200',
      otro: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return classes[rol] || classes['otro']; // ✅ CORREGIDO
  }

  /**
   * Abre el modal para crear un nuevo ticket asociado a esta unidad
   */
  crearTicket(): void {
    if (!this.unidad) {
      console.error('No hay unidad cargada');
      return;
    }

    // Obtener el usuario autenticado
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 Usuario autenticado:', currentUser);
    console.log('🔍 ID del usuario:', currentUser?.id);

    if (!currentUser || !currentUser.id) {
      console.error('No hay usuario autenticado');
      this.error = 'Debes iniciar sesión para crear un ticket.';
      return;
    }

    const dialogData = {
      userId: currentUser.id,
      consorcioId: this.unidad.consorcio_id,
      consorcioNombre: this.unidad.consorcio?.nombre,
      unidadId: this.unidad.id,
      unidadNombre: `${this.unidad.codigo} - Piso ${this.unidad.piso}`
    };
    console.log('📦 Datos que se pasarán al modal:', dialogData);

    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((ticket) => {
      if (ticket) {
        console.log('✅ Ticket creado:', ticket);
        this.loadUnidad();
        this.loadTickets();
      }
    });
  }

  /**
   * Navegar a agregar persona a la unidad
   */
  agregarPersona(): void {
    if (this.unidadId) {
      this.router.navigate(['/personas/nueva'], {
        queryParams: { unidadId: this.unidadId }
      });
    }
  }

  /**
   * Ver expensas de la unidad
   */
  verExpensas(): void {
    if (this.unidad?.consorcio_id) {
      this.router.navigate(['/expensas'], {
        queryParams: {
          consorcioId: this.unidad.consorcio_id,
          unidadId: this.unidadId
        }
      });
    }
  }

  /**
   * Cargar tickets de la unidad
   */
  loadTickets(): void {
    if (!this.unidadId) return;

    this.loadingTickets = true;
    this.ticketsService.getTickets({ unidadId: this.unidadId }).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loadingTickets = false;
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
        this.tickets = [];
        this.loadingTickets = false;
      }
    });
  }

  /**
   * Ver/Editar ticket - Abre el modal de edición
   */
  verTicket(ticketId: number): void {
    // Buscar el ticket en la lista
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      console.error('Ticket no encontrado:', ticketId);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Abrir modal con datos del ticket para edición
    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        ticketId: ticket.id,
        userId: currentUser.id,
        consorcioId: ticket.consorcioId,
        consorcioNombre: ticket.consorcioNombre,
        unidadId: ticket.unidadId,
        unidadNombre: ticket.unidadNombre,
        mode: 'edit'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('✅ Ticket actualizado:', result);
        this.loadTickets();
        this.loadUnidad();
      }
    });
  }

  /**
   * Obtener cantidad de tickets pendientes (abiertos, en proceso, pendientes)
   */
  getTicketsPendientes(): number {
    return this.tickets.filter(t =>
      t.estado === 'abierto' ||
      t.estado === 'en_proceso' ||
      t.estado === 'pendiente'
    ).length;
  }

  /**
   * Obtener clase de estado del ticket
   */
  getEstadoTicketClass(estado: string): string {
    const classes: { [key: string]: string } = {
      abierto: 'bg-red-100 text-red-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      resuelto: 'bg-green-100 text-green-800',
      cerrado: 'bg-gray-100 text-gray-800'
    };
    return classes[estado] || classes['abierto'];
  }

  /**
   * Obtener label del estado del ticket
   */
  getEstadoTicketLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      abierto: 'Abierto',
      en_proceso: 'En Proceso',
      pendiente: 'Pendiente',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    };
    return labels[estado] || estado;
  }

  /**
   * Obtener label del tipo de ticket
   */
  getTipoTicketLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      mantenimiento: 'Mantenimiento',
      reclamo: 'Reclamo',
      limpieza: 'Limpieza',
      administrativo: 'Administrativo',
      mejora: 'Mejora',
      otro: 'Otro'
    };
    return labels[tipo] || tipo;
  }

  /**
   * Obtener clase de prioridad del ticket
   */
  getPrioridadTicketClass(prioridad: string): string {
    const classes: { [key: string]: string } = {
      baja: 'bg-gray-100 text-gray-800',
      media: 'bg-blue-100 text-blue-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return classes[prioridad] || classes['media'];
  }

  /**
   * Obtener label de prioridad del ticket
   */
  getPrioridadTicketLabel(prioridad: string): string {
    const labels: { [key: string]: string } = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      critica: 'Crítica'
    };
    return labels[prioridad] || prioridad;
  }

  /**
   * Toggle sección colapsable
   */
  toggleSection(section: string): void {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }
}