/**
 * =========================================
 * PROVEEDOR MODEL
 * =========================================
 * Interfaces y tipos para el módulo de proveedores
 */

export interface Proveedor {
  id: number;
  persona_id: number;
  razon_social: string;
  cuit: string;
  rubro: string;
  observaciones?: string;
  activo: boolean;

  // Relación con persona
  persona?: PersonaBasic;

  // Consorcios donde provee servicios
  consorcios?: ConsorcioProveedorRelacion[];

  // Estadísticas de tickets
  tickets_totales?: number;
  tickets_resueltos?: number;
  tickets_pendientes?: number;
}

export interface PersonaBasic {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  tipo_persona: 'fisica' | 'juridica';
}

export interface ConsorcioProveedorRelacion {
  id: number;
  consorcio_id: number;
  proveedor_id: number;
  servicio: string;
  contrato_desde?: string;
  contrato_hasta?: string | null;
  estado: 'activo' | 'inactivo';
  
  // Datos del consorcio
  consorcio?: {
    id: number;
    nombre: string;
    direccion?: string;
    ciudad?: string;
  };
}

export interface CreateProveedorDto {
  persona_id: number;
  razon_social: string;
  cuit: string;
  rubro: string;
  observaciones?: string;
  activo?: boolean;
}

export interface UpdateProveedorDto {
  razon_social?: string;
  cuit?: string;
  rubro?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface ProveedorFilters {
  search?: string;
  rubro?: string;
  activo?: boolean;
  consorcio_id?: number;
  page?: number;
  limit?: number;
  sortBy?: 'razon_social' | 'rubro' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProveedoresResponse {
  data: Proveedor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProveedoresStats {
  total: number;
  activos: number;
  inactivos: number;
  porRubro: {
    rubro: string;
    cantidad: number;
  }[];
  ticketsTotales: number;
  ticketsResueltos: number;
  ticketsPendientes: number;
}

export interface AsignarConsorcioDto {
  consorcio_id: number;
  proveedor_id: number;
  servicio: string;
  contrato_desde?: string;
  contrato_hasta?: string;
  estado?: 'activo' | 'inactivo';
}

// Rubros comunes
export const RUBROS_COMUNES = [
  'Electricidad',
  'Plomería',
  'Gasista',
  'Pintura',
  'Limpieza',
  'Seguridad',
  'Jardinería',
  'Mantenimiento General',
  'Ascensores',
  'Aire Acondicionado',
  'Cerrajería',
  'Fumigación',
  'Sistemas de Seguridad',
  'Otros'
];

// Estados
export const ESTADO_PROVEEDOR_LABELS: Record<'activo' | 'inactivo', string> = {
  activo: 'Activo',
  inactivo: 'Inactivo'
};

export const ESTADO_PROVEEDOR_COLORS: Record<'activo' | 'inactivo', string> = {
  activo: 'bg-green-100 text-green-800 border-green-200',
  inactivo: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const ESTADO_PROVEEDOR_ICONS: Record<'activo' | 'inactivo', string> = {
  activo: '✓',
  inactivo: '✗'
};

// Helpers
export function formatCUIT(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`;
  }
  return cuit;
}

export function validarCUIT(cuit: string): boolean {
  const regex = /^\d{2}-\d{8}-\d{1}$/;
  return regex.test(cuit);
}