/**
 * =========================================
 * CONSORCIO MODEL
 * =========================================
 * Interfaces y tipos para el módulo de consorcios
 */

export type EstadoConsorcio = 'activo' | 'inactivo';

/**
 * Interface principal de Consorcio
 */
export interface Consorcio {
  id: number;
  tenant_id?: number | null;
  nombre: string;
  codigo_ext: string;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  cuit?: string | null;
  telefono_contacto?: string | null;
  email_contacto?: string | null;
  responsable_id?: number | null;
  estado: EstadoConsorcio;
  creado_en: Date;

  // Relaciones
  responsable?: ResponsableBasic;
  unidades?: UnidadBasic[];

  // Estadísticas (calculadas)
  stats?: ConsorcioStats;
}

/**
 * Información básica del responsable
 */
export interface ResponsableBasic {
  id: number;
  username: string;
  email: string;
  rol_global: string;
  persona?: {
    nombre: string;
    apellido: string;
    documento: string;
    telefono: string;
  };
}

/**
 * Información básica de unidad funcional
 */
export interface UnidadBasic {
  nombre: string;
  id: number;
  codigo: string;
  piso?: string;
  estado: 'ocupado' | 'vacante' | 'mantenimiento';
  // Campos adicionales para compatibilidad con UnidadFuncional
  consorcio_id?: number;
  superficie?: number;
  porcentaje_participacion?: number;
  tickets_count?: number;
  consorcio?: {
    id: number;
    nombre: string;
    direccion?: string;
    estado?: string;
  };
  personas?: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol_unidad: 'propietario' | 'inquilino' | 'responsable' | 'otro';
    fecha_desde?: string;
    fecha_hasta?: string | null;
  }>;
}

/**
 * Estadísticas del consorcio
 */
export interface ConsorcioStats {
  totalUnidades: number;
  unidadesOcupadas: number;
  unidadesVacantes?: number;
  superficieTotal?: number;
  ticketsPendientes?: number;
}

/**
 * DTO para crear un nuevo consorcio
 */
export interface CreateConsorcioDto {
  tenant_id?: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  cuit?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  responsable_id?: number;
}

/**
 * DTO para actualizar un consorcio
 */
export interface UpdateConsorcioDto {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  cuit?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  responsable_id?: number;
  estado?: EstadoConsorcio;
}

/**
 * Filtros para buscar consorcios
 */
export interface ConsorcioFilters {
  search?: string;
  codigo_ext?: string;
  estado?: EstadoConsorcio;
  ciudad?: string;
  provincia?: string;
  responsable_id?: number;
  tiene_tickets_pendientes?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'nombre' | 'ciudad' | 'creado_en';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de consorcios
 */
export interface ConsorciosResponse {
  data: Consorcio[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Estadísticas generales de consorcios
 */
export interface ConsorciosGeneralStats {
  consorcios: {
    total: number;
    activos: number;
    inactivos: number;
  };
  totalUnidades: number;
  porCiudad: Array<{
    ciudad: string;
    cantidad: number;
  }>;
  porProvincia: Array<{
    provincia: string;
    cantidad: number;
  }>;
}

/**
 * Labels para estados
 */
export const ESTADO_LABELS: Record<EstadoConsorcio, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo'
};

/**
 * Colores para estados (para badges)
 */
export const ESTADO_COLORS: Record<EstadoConsorcio, string> = {
  activo: 'bg-green-100 text-green-800 border-green-200',
  inactivo: 'bg-gray-100 text-gray-800 border-gray-200'
};

/**
 * Iconos para estados
 */
export const ESTADO_ICONS: Record<EstadoConsorcio, string> = {
  activo: '✓',
  inactivo: '✗'
};

/**
 * Provincias de Argentina (para select)
 */
export const PROVINCIAS_ARGENTINA = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

/**
 * Validador de CUIT
 */
export function validarCUIT(cuit: string): boolean {
  const regex = /^\d{2}-\d{8}-\d{1}$/;
  return regex.test(cuit);
}

/**
 * Formateador de CUIT (agrega guiones)
 */
export function formatearCUIT(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`;
  }
  return cuit;
}

/**
 * Obtener nombre completo del responsable
 */
export function getNombreResponsable(consorcio: Consorcio): string {
  if (!consorcio.responsable?.persona) {
    return 'Sin responsable';
  }
  const { nombre, apellido } = consorcio.responsable.persona;
  return `${nombre} ${apellido}`;
}

/**
 * Obtener dirección completa formateada
 */
export function getDireccionCompleta(consorcio: Consorcio): string {
  const partes: string[] = [];
  
  if (consorcio.direccion) partes.push(consorcio.direccion);
  if (consorcio.ciudad) partes.push(consorcio.ciudad);
  if (consorcio.provincia) partes.push(consorcio.provincia);
  
  return partes.join(', ') || 'Sin dirección';
}