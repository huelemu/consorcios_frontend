/**
 * =========================================
 * UNIDAD MODEL
 * =========================================
 * Interfaces y tipos para el módulo de unidades funcionales
 */
export type EstadoUnidad = 'ocupado' | 'vacante' | 'mantenimiento';
export type RolUnidad = 'propietario' | 'inquilino' | 'responsable' | 'otro';

export interface UnidadFuncional {
  id: number;
  consorcio_id: number;
  codigo: string;
  piso: string;
  superficie: number;
  porcentaje_participacion: number;
  estado: 'ocupado' | 'vacante' | 'mantenimiento';
  
  // Relaciones
  consorcio?: ConsorcioBasic;
  personas?: PersonaUnidad[];
  tickets_count?: number;
}

export interface ConsorcioBasic {
  id: number;
  nombre: string;
  direccion?: string;
  estado?: string;
}

export interface PersonaUnidad {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol_unidad: 'propietario' | 'inquilino' | 'responsable' | 'otro';
  fecha_desde?: string;
  fecha_hasta?: string | null;
}

export interface UnidadInput {
  consorcio_id: number;
  codigo: string;
  piso?: string;
  superficie?: number;
  porcentaje_participacion?: number;
  estado?: 'ocupado' | 'vacante' | 'mantenimiento';
}

export interface UnidadesResponse {
  data: UnidadFuncional[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnidadFilters {
  page?: number;
  limit?: number;
  search?: string;
  piso?: string;
  consorcio_id?: number | string;
  estado?: 'ocupado' | 'vacante' | 'mantenimiento' | '';
  tiene_tickets_pendientes?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UnidadesStats {
  total: number;
  ocupadas: number;
  vacantes: number;
  mantenimiento: number;
  conTickets: number;
}

export interface CreateUnidadDto {
  consorcio_id: number;
  codigo: string;
  piso: string;
  superficie: number;
  porcentaje_participacion: number;
  estado?: EstadoUnidad;
}

export interface UpdateUnidadDto {
  codigo?: string;
  piso?: string;
  superficie?: number;
  porcentaje_participacion?: number;
  estado?: EstadoUnidad;
}


export interface PersonaBasic {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  tipo_persona: 'fisica' | 'juridica';
}


export interface ExpensaBasic {
  id: number;
  unidad_id: number;
  periodo: string;
  monto: number;
  pagado: boolean;
  fecha_vencimiento: string;
}


export interface UnidadStats {
  total: number;
  ocupadas: number;
  vacantes: number;
  enMantenimiento: number;
  porConsorcio: {
    consorcio_id: number;
    consorcio_nombre: string;
    cantidad: number;
  }[];
  superficieTotal: number;
  superficiePromedio: number;
}


export const ESTADO_UNIDAD_LABELS: Record<EstadoUnidad, string> = {
  ocupado: 'Ocupada',
  vacante: 'Vacante',
  mantenimiento: 'En Mantenimiento'
};


export const ESTADO_UNIDAD_COLORS: Record<EstadoUnidad, string> = {
  ocupado: 'bg-green-100 text-green-800 border-green-200',
  vacante: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  mantenimiento: 'bg-red-100 text-red-800 border-red-200'
};


export const ESTADO_UNIDAD_ICONS: Record<EstadoUnidad, string> = {
  ocupado: '🏠',
  vacante: '🔓',
  mantenimiento: '🔧'
};


export const ROL_UNIDAD_LABELS: Record<RolUnidad, string> = {
  propietario: 'Propietario',
  inquilino: 'Inquilino',
  responsable: 'Responsable',
  otro: 'Otro'
};


export const ROL_UNIDAD_COLORS: Record<RolUnidad, string> = {
  propietario: 'bg-blue-100 text-blue-800 border-blue-200',
  inquilino: 'bg-purple-100 text-purple-800 border-purple-200',
  responsable: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  otro: 'bg-gray-100 text-gray-800 border-gray-200'
};


export const ROL_UNIDAD_ICONS: Record<RolUnidad, string> = {
  propietario: '👤',
  inquilino: '🏘️',
  responsable: '🔑',
  otro: '📋'
};