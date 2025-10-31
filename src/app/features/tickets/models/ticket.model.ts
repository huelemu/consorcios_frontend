export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';
export type TicketState = 'abierto' | 'en_proceso' | 'pendiente' | 'resuelto' | 'cerrado';

export type TicketType =
  | 'mantenimiento'
  | 'reclamo'
  | 'limpieza'
  | 'administrativo'
  | 'mejora'
  | 'otro';

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  size?: number;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface TicketHistoryEntry {
  id: number;
  date: string;
  userId: number;
  userName: string;
  action: 'creado' | 'actualizado' | 'estado' | 'asignado' | 'comentario' | 'adjunto' | 'costos';
  description: string;
  metadata?: Record<string, unknown>;
}

export interface TicketNotificationSettings {
  notifyCreator: boolean;
  notifyProvider: boolean;
  notifyPropietario: boolean;
  notifyInquilino: boolean;
  notifyEncargado: boolean;
}

export interface Ticket {
  id: number;
  consorcioId: number;
  consorcioNombre: string;
  unidadId: number;
  unidadNombre: string;
  creadoPorId: number;
  creadoPorNombre: string;
  creadorRol: 'admin_global' | 'tenant_admin' | 'admin_consorcio' | 'admin_edificio' | 'propietario' | 'inquilino';
  asignadoAId?: number;
  asignadoANombre?: string;
  asignadoRol?: 'proveedor' | 'encargado' | 'admin_consorcio' | 'otro';
  proveedorId?: number;
  proveedorNombre?: string;
  proveedorRubro?: string;
  tipo: TicketType;
  titulo: string;
  descripcion: string;
  prioridad: TicketPriority;
  estado: TicketState;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaResolucion?: string;
  fechaCierre?: string;
  estimacionCosto?: number;
  costoFinal?: number;
  comentarios: TicketComment[];
  historial: TicketHistoryEntry[];
  adjuntos: TicketAttachment[];
  notificaciones: TicketNotificationSettings;
}

export interface TicketFilters {
  consorcioId?: number;
  unidadId?: number;
  prioridad?: TicketPriority;
  estado?: TicketState;
  tipo?: TicketType;
  asignadoRol?: Ticket['asignadoRol'];
  proveedorId?: number;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketMetricSummary {
  estado: TicketState;
  label: string;
  count: number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  variation?: number;
}
