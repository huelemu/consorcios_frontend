import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Ticket,
  TicketFilters,
  TicketMetricSummary,
  TicketPriority,
  TicketState,
  TicketType
} from '../models/ticket.model';

interface ConsorcioOption {
  id: number;
  nombre: string;
}

interface UnidadOption {
  id: number;
  consorcioId: number;
  consorcioNombre: string;
  nombre: string;
  piso: string;
  unidad: string;
  propietarioId?: number;
  propietarioNombre?: string;
  inquilinoId?: number;
  inquilinoNombre?: string;
}

interface ProveedorOption {
  id: number;
  personaId: number;
  razonSocial: string;
  cuit: string;
  rubro: string;
  observaciones?: string;
  activo: boolean;
  contactoEmail: string;
  contactoTelefono: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly consorcios: ConsorcioOption[] = [
    { id: 1, nombre: 'Consorcio Av. Siempre Viva 742' },
    { id: 2, nombre: 'Consorcio Las Rosas' },
    { id: 3, nombre: 'Consorcio Torre Central' }
  ];

  private readonly unidades: UnidadOption[] = [
    {
      id: 1,
      consorcioId: 1,
      consorcioNombre: 'Consorcio Av. Siempre Viva 742',
      nombre: 'UF 1A',
      piso: '1',
      unidad: 'A',
      propietarioId: 201,
      propietarioNombre: 'María González',
      inquilinoId: 301,
      inquilinoNombre: 'Carlos López'
    },
    {
      id: 2,
      consorcioId: 1,
      consorcioNombre: 'Consorcio Av. Siempre Viva 742',
      nombre: 'UF 3B',
      piso: '3',
      unidad: 'B',
      propietarioId: 202,
      propietarioNombre: 'Juan Pérez'
    },
    {
      id: 3,
      consorcioId: 2,
      consorcioNombre: 'Consorcio Las Rosas',
      nombre: 'UF PB 2',
      piso: 'PB',
      unidad: '2',
      propietarioId: 203,
      propietarioNombre: 'Lucía Fernández',
      inquilinoId: 302,
      inquilinoNombre: 'Federico Martínez'
    },
    {
      id: 4,
      consorcioId: 3,
      consorcioNombre: 'Consorcio Torre Central',
      nombre: 'UF 12C',
      piso: '12',
      unidad: 'C',
      propietarioId: 204,
      propietarioNombre: 'Silvia Romero'
    }
  ];

  private readonly proveedores: ProveedorOption[] = [
    {
      id: 401,
      personaId: 501,
      razonSocial: 'ElectroSoluciones SRL',
      cuit: '30-12345678-9',
      rubro: 'Electricidad',
      observaciones: 'Atención 24/7, especialista en emergencias eléctricas',
      activo: true,
      contactoEmail: 'contacto@electrosoluciones.com',
      contactoTelefono: '+54 11 3456-7890'
    },
    {
      id: 402,
      personaId: 502,
      razonSocial: 'Plomeros Unidos',
      cuit: '30-87654321-0',
      rubro: 'Plomería',
      observaciones: 'Amplia experiencia en edificios históricos',
      activo: true,
      contactoEmail: 'turnos@plomerosunidos.com',
      contactoTelefono: '+54 11 4567-8901'
    },
    {
      id: 403,
      personaId: 503,
      razonSocial: 'Limpieza Premium S.A.',
      cuit: '30-11223344-5',
      rubro: 'Limpieza y Mantenimiento',
      observaciones: 'Especialistas en limpiezas profundas y post-obra',
      activo: true,
      contactoEmail: 'ventas@limpiezapremium.com',
      contactoTelefono: '+54 11 5678-9012'
    }
  ];

  private readonly ticketsSource = new BehaviorSubject<Ticket[]>([
    {
      id: 1001,
      consorcioId: 1,
      consorcioNombre: 'Consorcio Av. Siempre Viva 742',
      unidadId: 1,
      unidadNombre: 'UF 1A',
      creadoPorId: 5,
      creadoPorNombre: 'Laura Medina',
      creadorRol: 'propietario',
      asignadoAId: 401,
      asignadoANombre: 'ElectroSoluciones SRL',
      asignadoRol: 'proveedor',
      proveedorId: 401,
      proveedorNombre: 'ElectroSoluciones SRL',
      proveedorRubro: 'Electricidad',
      tipo: 'mantenimiento',
      titulo: 'La luz del pasillo no funciona',
      descripcion:
        'El sensor de movimiento del pasillo del 1er piso dejó de funcionar y las luces quedan apagadas por la noche.',
      prioridad: 'media',
      estado: 'en_proceso',
      fechaCreacion: '2025-10-22T19:17:28Z',
      fechaActualizacion: '2025-10-23T11:45:00Z',
      comentarios: [
        {
          id: 1,
          ticketId: 1001,
          authorId: 5,
          authorName: 'Laura Medina',
          message: 'Se reporta falla intermitente desde hace 3 días.',
          createdAt: '2025-10-22T19:20:00Z'
        },
        {
          id: 2,
          ticketId: 1001,
          authorId: 401,
          authorName: 'ElectroSoluciones SRL',
          message: 'Programamos visita para mañana a las 10hs.',
          createdAt: '2025-10-23T08:00:00Z'
        }
      ],
      historial: [
        {
          id: 1,
          date: '2025-10-22T19:17:28Z',
          userId: 5,
          userName: 'Laura Medina',
          action: 'creado',
          description: 'Ticket creado por propietaria de la UF 1A.'
        },
        {
          id: 2,
          date: '2025-10-22T19:18:40Z',
          userId: 12,
          userName: 'Martín Ruiz',
          action: 'asignado',
          description: 'Se asigna a ElectroSoluciones SRL.',
          metadata: { proveedorId: 401 }
        },
        {
          id: 3,
          date: '2025-10-23T11:45:00Z',
          userId: 401,
          userName: 'ElectroSoluciones SRL',
          action: 'actualizado',
          description: 'Se agenda visita técnica para inspección.'
        }
      ],
      adjuntos: [
        {
          id: 1,
          fileName: 'fotos_pasillo.zip',
          fileType: 'application/zip',
          uploadedAt: '2025-10-22T19:25:00Z',
          uploadedBy: 'Laura Medina',
          url: '#'
        }
      ],
      estimacionCosto: 45000,
      notificaciones: {
        notifyCreator: true,
        notifyProvider: true,
        notifyPropietario: true,
        notifyInquilino: false,
        notifyEncargado: true
      }
    },
    {
      id: 1002,
      consorcioId: 1,
      consorcioNombre: 'Consorcio Av. Siempre Viva 742',
      unidadId: 2,
      unidadNombre: 'UF 3B',
      creadoPorId: 6,
      creadoPorNombre: 'Federico Núñez',
      creadorRol: 'inquilino',
      asignadoAId: 402,
      asignadoANombre: 'Plomeros Unidos',
      asignadoRol: 'proveedor',
      proveedorId: 402,
      proveedorNombre: 'Plomeros Unidos',
      proveedorRubro: 'Plomería',
      tipo: 'reclamo',
      titulo: 'Humedad en la pared del baño',
      descripcion:
        'Se detecta humedad persistente en la pared del baño principal que afecta al vecino contiguo.',
      prioridad: 'alta',
      estado: 'abierto',
      fechaCreacion: '2025-10-22T19:17:28Z',
      fechaActualizacion: '2025-10-22T19:17:28Z',
      comentarios: [
        {
          id: 3,
          ticketId: 1002,
          authorId: 6,
          authorName: 'Federico Núñez',
          message: 'Adjunto fotos de la pared con humedad.',
          createdAt: '2025-10-22T19:19:00Z'
        }
      ],
      historial: [
        {
          id: 4,
          date: '2025-10-22T19:17:28Z',
          userId: 6,
          userName: 'Federico Núñez',
          action: 'creado',
          description: 'Ticket creado por inquilino de la UF 3B.'
        },
        {
          id: 5,
          date: '2025-10-22T19:18:10Z',
          userId: 11,
          userName: 'Andrea Paredes',
          action: 'asignado',
          description: 'Se asigna a Plomeros Unidos para diagnóstico.',
          metadata: { proveedorId: 402 }
        }
      ],
      adjuntos: [
        {
          id: 2,
          fileName: 'humedad_bano.jpg',
          fileType: 'image/jpeg',
          uploadedAt: '2025-10-22T19:19:05Z',
          uploadedBy: 'Federico Núñez',
          url: '#'
        }
      ],
      estimacionCosto: 120000,
      notificaciones: {
        notifyCreator: true,
        notifyProvider: true,
        notifyPropietario: true,
        notifyInquilino: true,
        notifyEncargado: true
      }
    },
    {
      id: 1003,
      consorcioId: 2,
      consorcioNombre: 'Consorcio Las Rosas',
      unidadId: 3,
      unidadNombre: 'UF PB 2',
      creadoPorId: 18,
      creadoPorNombre: 'Florencia Díaz',
      creadorRol: 'admin_consorcio',
      asignadoAId: 205,
      asignadoANombre: 'Diego Morales',
      asignadoRol: 'encargado',
      tipo: 'limpieza',
      titulo: 'Limpieza profunda post evento',
      descripcion:
        'Se requiere limpieza profunda de SUM y áreas comunes luego del evento del fin de semana.',
      prioridad: 'media',
      estado: 'pendiente',
      fechaCreacion: '2025-10-20T10:00:00Z',
      fechaActualizacion: '2025-10-21T08:30:00Z',
      comentarios: [
        {
          id: 4,
          ticketId: 1003,
          authorId: 205,
          authorName: 'Diego Morales',
          message: 'Se coordina limpieza para el martes a primera hora.',
          createdAt: '2025-10-21T08:30:00Z'
        }
      ],
      historial: [
        {
          id: 6,
          date: '2025-10-20T10:00:00Z',
          userId: 18,
          userName: 'Florencia Díaz',
          action: 'creado',
          description: 'Ticket creado por administradora del consorcio.'
        },
        {
          id: 7,
          date: '2025-10-21T08:30:00Z',
          userId: 205,
          userName: 'Diego Morales',
          action: 'actualizado',
          description: 'Encargado confirma limpieza programada.'
        }
      ],
      adjuntos: [],
      notificaciones: {
        notifyCreator: true,
        notifyProvider: false,
        notifyPropietario: false,
        notifyInquilino: false,
        notifyEncargado: true
      }
    },
    {
      id: 1004,
      consorcioId: 3,
      consorcioNombre: 'Consorcio Torre Central',
      unidadId: 4,
      unidadNombre: 'UF 12C',
      creadoPorId: 25,
      creadoPorNombre: 'Gustavo Herrera',
      creadorRol: 'propietario',
      asignadoAId: 403,
      asignadoANombre: 'Limpieza Premium S.A.',
      asignadoRol: 'proveedor',
      proveedorId: 403,
      proveedorNombre: 'Limpieza Premium S.A.',
      proveedorRubro: 'Limpieza y Mantenimiento',
      tipo: 'mejora',
      titulo: 'Pulido de pisos en hall de entrada',
      descripcion:
        'Solicito presupuesto para pulido y vitrificado de pisos en hall de entrada del piso 12.',
      prioridad: 'baja',
      estado: 'resuelto',
      fechaCreacion: '2025-10-10T14:30:00Z',
      fechaActualizacion: '2025-10-15T09:45:00Z',
      fechaResolucion: '2025-10-15T09:45:00Z',
      fechaCierre: '2025-10-20T15:00:00Z',
      comentarios: [
        {
          id: 5,
          ticketId: 1004,
          authorId: 403,
          authorName: 'Limpieza Premium S.A.',
          message: 'Trabajo finalizado. Adjuntamos comprobante.',
          createdAt: '2025-10-15T09:45:00Z'
        }
      ],
      historial: [
        {
          id: 8,
          date: '2025-10-10T14:30:00Z',
          userId: 25,
          userName: 'Gustavo Herrera',
          action: 'creado',
          description: 'Ticket creado por propietario de la UF 12C.'
        },
        {
          id: 9,
          date: '2025-10-12T09:00:00Z',
          userId: 14,
          userName: 'Cecilia Rivas',
          action: 'asignado',
          description: 'Se asigna a Limpieza Premium S.A.',
          metadata: { proveedorId: 403 }
        },
        {
          id: 10,
          date: '2025-10-15T09:45:00Z',
          userId: 403,
          userName: 'Limpieza Premium S.A.',
          action: 'estado',
          description: 'Se marca como resuelto tras realizar el servicio.',
          metadata: { estado: 'resuelto' }
        },
        {
          id: 11,
          date: '2025-10-20T15:00:00Z',
          userId: 25,
          userName: 'Gustavo Herrera',
          action: 'estado',
          description: 'Propietario confirma cierre del ticket.',
          metadata: { estado: 'cerrado' }
        }
      ],
      adjuntos: [
        {
          id: 3,
          fileName: 'comprobante_servicio.pdf',
          fileType: 'application/pdf',
          uploadedAt: '2025-10-15T09:50:00Z',
          uploadedBy: 'Limpieza Premium S.A.',
          url: '#'
        }
      ],
      estimacionCosto: 220000,
      costoFinal: 210500,
      notificaciones: {
        notifyCreator: true,
        notifyProvider: true,
        notifyPropietario: true,
        notifyInquilino: false,
        notifyEncargado: true
      }
    }
  ]);

  readonly tickets$ = this.ticketsSource.asObservable();

  getConsorcios(): ConsorcioOption[] {
    return this.consorcios;
  }

  getUnidades(): UnidadOption[] {
    return this.unidades;
  }

  getProveedores(): ProveedorOption[] {
    return this.proveedores;
  }

  getTickets(filters?: TicketFilters): Ticket[] {
    const tickets = this.ticketsSource.value;

    if (!filters) {
      return tickets;
    }

    return tickets.filter(ticket => {
      const matchesConsorcio =
        !filters.consorcioId || ticket.consorcioId === filters.consorcioId;
      const matchesUnidad = !filters.unidadId || ticket.unidadId === filters.unidadId;
      const matchesPrioridad =
        !filters.prioridad || ticket.prioridad === filters.prioridad;
      const matchesEstado = !filters.estado || ticket.estado === filters.estado;
      const matchesTipo = !filters.tipo || ticket.tipo === filters.tipo;
      const matchesAsignadoRol =
        !filters.asignadoRol || ticket.asignadoRol === filters.asignadoRol;
      const matchesProveedor =
        !filters.proveedorId || ticket.proveedorId === filters.proveedorId;
      const matchesSearch = !filters.searchTerm
        || `${ticket.titulo} ${ticket.descripcion} ${ticket.consorcioNombre} ${ticket.unidadNombre}`
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      return (
        matchesConsorcio &&
        matchesUnidad &&
        matchesPrioridad &&
        matchesEstado &&
        matchesTipo &&
        matchesAsignadoRol &&
        matchesProveedor &&
        matchesSearch
      );
    });
  }

  getTicketMetricSummary(): TicketMetricSummary[] {
    const tickets = this.ticketsSource.value;
    const states: TicketState[] = ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado'];

    return states.map(state => ({
      estado: state,
      label: this.getEstadoLabel(state),
      count: tickets.filter(ticket => ticket.estado === state).length,
      icon: this.getEstadoIcon(state),
      trend: 'stable' as const,
      variation: 0
    }));
  }

  getPrioridades(): TicketPriority[] {
    return ['baja', 'media', 'alta', 'critica'];
  }

  getTipos(): TicketType[] {
    return ['mantenimiento', 'reclamo', 'limpieza', 'administrativo', 'mejora', 'otro'];
  }

  private getEstadoLabel(estado: TicketState): string {
    switch (estado) {
      case 'abierto':
        return 'Abiertos';
      case 'en_proceso':
        return 'En proceso';
      case 'pendiente':
        return 'Pendientes';
      case 'resuelto':
        return 'Resueltos';
      case 'cerrado':
        return 'Cerrados';
      default:
        return estado;
    }
  }

  private getEstadoIcon(estado: TicketState): string {
    switch (estado) {
      case 'abierto':
        return '🆕';
      case 'en_proceso':
        return '⚙️';
      case 'pendiente':
        return '⏳';
      case 'resuelto':
        return '✅';
      case 'cerrado':
        return '🔒';
      default:
        return '🎫';
    }
  }
}