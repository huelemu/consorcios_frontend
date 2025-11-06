// src/app/features/tickets/models/ticket.model.ts - REEMPLAZAR COMPLETO

export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';
export type TicketState = 'abierto' | 'en_proceso' | 'pendiente' | 'resuelto' | 'cerrado';
export type TicketType = 'mantenimiento' | 'reclamo' | 'limpieza' | 'administrativo' | 'mejora' | 'otro';

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: number;
  url: string;
  size?: number;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string;
  isInternal: boolean;
}

export interface TicketHistoryEntry {
  id: number;
  date: string;
  userId: number | null;
  userName: string;
  action: 'creado' | 'actualizado' | 'estado' | 'asignado' | 'comentario' | 'adjunto' | 'costos';
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Ticket {
  id: number;
  consorcioId: number;
  consorcioNombre: string;
  unidadId: number | null;
  unidadNombre: string | null;
  creadoPorId: number;
  creadoPorNombre: string;
  creadorRol: string;
  asignadoAId?: number | null;
  asignadoANombre?: string | null;
  asignadoRol?: string | null;
  proveedorId?: number | null;
  proveedorNombre?: string | null;
  proveedorRubro?: string | null;
  tipo: TicketType;
  titulo: string;
  descripcion: string;
  prioridad: TicketPriority;
  estado: TicketState;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaResolucion?: string | null;
  fechaCierre?: string | null;
  estimacionCosto?: number | null;
  costoFinal?: number | null;
  comentarios: TicketComment[];
  historial: TicketHistoryEntry[];
  adjuntos: TicketAttachment[];
  updatedAt: string;
}

export interface TicketFilters {
  search?: string;
  estado?: string;
  tipo?: string;
  prioridad?: string;
  consorcioId?: number;
  unidadId?: number;
  asignadoRol?: string;
  proveedorId?: number;
  searchTerm?: string;
}