/**
 * =========================================
 * PROVEEDOR MODEL
 * =========================================
 * Interfaces y tipos para el módulo de proveedores
 */

// ========================================
// Tipos y Enums
// ========================================
export type TipoEntidad = 'fisica' | 'juridica';
export type RolPersonaProveedor = 'titular' | 'responsable_tecnico' | 'administrativo' | 'contacto_comercial' | 'otro';
export type TipoCuenta = 'corriente' | 'caja_ahorro';
export type TipoMoneda = 'ARS' | 'USD';
export type CondicionIVA = 'responsable_inscripto' | 'monotributo' | 'exento' | 'no_categorizado';

// ========================================
// Interfaz Principal: Proveedor
// ========================================
export interface Proveedor {
  id: number;

  // Información básica
  razon_social: string;
  tipo_entidad: TipoEntidad;
  cuit: string;
  rubro: string;

  // Información de contacto general
  email_general?: string;
  telefono?: string;

  // Ubicación
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  cod_postal?: string;

  // Información fiscal
  condicion_iva?: CondicionIVA;

  // Otros
  observaciones?: string;
  activo: boolean;

  // ========================================
  // Relaciones (nuevo modelo relacional)
  // ========================================

  // Personas vinculadas con roles específicos (N:N)
  personas?: ProveedorPersona[];

  // Cuentas bancarias (1:N)
  cuentas_bancarias?: ProveedorCuentaBancaria[];

  // Consorcios donde provee servicios (N:M)
  consorcios?: ConsorcioProveedorRelacion[];

  // ========================================
  // Compatibilidad con modelo anterior
  // ========================================
  persona_id?: number;  // Mantener por compatibilidad
  persona?: PersonaBasic;  // Contacto principal legacy

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

// ========================================
// Nuevas Entidades Relacionales
// ========================================

/**
 * Representa una persona vinculada a un proveedor con un rol específico
 * Relación N:N entre Proveedor y Persona
 */
export interface ProveedorPersona {
  id: number;
  proveedor_id: number;
  persona_id: number;
  rol: RolPersonaProveedor;
  desde: string;  // ISO date
  hasta?: string | null;  // ISO date
  es_principal: boolean;  // Indica si es el contacto principal

  // Relación con persona (populated)
  persona?: PersonaBasic;
}

/**
 * Cuenta bancaria asociada a un proveedor
 * Relación 1:N (un proveedor puede tener múltiples cuentas)
 */
export interface ProveedorCuentaBancaria {
  id: number;
  proveedor_id: number;

  // Información bancaria
  banco?: string;
  titular: string;
  cuit_titular: string;
  cbu: string;
  alias?: string;
  tipo_cuenta?: TipoCuenta;
  moneda?: TipoMoneda;

  // Estado
  predeterminada: boolean;
  activa: boolean;
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

// ========================================
// DTOs para Proveedor
// ========================================

export interface CreateProveedorDto {
  // Información básica
  razon_social: string;
  tipo_entidad: TipoEntidad;
  cuit: string;
  rubro: string;

  // Información de contacto
  email_general?: string;
  telefono?: string;

  // Ubicación
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  cod_postal?: string;

  // Información fiscal
  condicion_iva?: CondicionIVA;

  // Otros
  observaciones?: string;
  activo?: boolean;

  // Compatibilidad
  persona_id?: number;  // Opcional, para migración
}

export interface UpdateProveedorDto {
  razon_social?: string;
  tipo_entidad?: TipoEntidad;
  cuit?: string;
  rubro?: string;
  email_general?: string;
  telefono?: string;
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  cod_postal?: string;
  condicion_iva?: CondicionIVA;
  observaciones?: string;
  activo?: boolean;
}

// ========================================
// DTOs para ProveedorPersona
// ========================================

export interface CreateProveedorPersonaDto {
  proveedor_id: number;
  persona_id: number;
  rol: RolPersonaProveedor;
  desde: string;  // ISO date
  hasta?: string;  // ISO date
  es_principal?: boolean;
}

export interface UpdateProveedorPersonaDto {
  rol?: RolPersonaProveedor;
  desde?: string;
  hasta?: string;
  es_principal?: boolean;
}

// ========================================
// DTOs para ProveedorCuentaBancaria
// ========================================

export interface CreateProveedorCuentaBancariaDto {
  proveedor_id: number;
  banco?: string;
  titular: string;
  cuit_titular: string;
  cbu: string;
  alias?: string;
  tipo_cuenta?: TipoCuenta;
  moneda?: TipoMoneda;
  predeterminada?: boolean;
  activa?: boolean;
}

export interface UpdateProveedorCuentaBancariaDto {
  banco?: string;
  titular?: string;
  cuit_titular?: string;
  cbu?: string;
  alias?: string;
  tipo_cuenta?: TipoCuenta;
  moneda?: TipoMoneda;
  predeterminada?: boolean;
  activa?: boolean;
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

// ========================================
// Constantes para Roles de Personas
// ========================================
export const ROL_PERSONA_LABELS: Record<RolPersonaProveedor, string> = {
  titular: 'Titular',
  responsable_tecnico: 'Responsable Técnico',
  administrativo: 'Administrativo',
  contacto_comercial: 'Contacto Comercial',
  otro: 'Otro'
};

export const ROL_PERSONA_COLORS: Record<RolPersonaProveedor, string> = {
  titular: 'bg-blue-100 text-blue-800 border-blue-200',
  responsable_tecnico: 'bg-purple-100 text-purple-800 border-purple-200',
  administrativo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  contacto_comercial: 'bg-green-100 text-green-800 border-green-200',
  otro: 'bg-gray-100 text-gray-800 border-gray-200'
};

// ========================================
// Constantes para Condición IVA
// ========================================
export const CONDICION_IVA_LABELS: Record<CondicionIVA, string> = {
  responsable_inscripto: 'Responsable Inscripto',
  monotributo: 'Monotributo',
  exento: 'Exento',
  no_categorizado: 'No Categorizado'
};

// ========================================
// Constantes para Tipo de Cuenta
// ========================================
export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  corriente: 'Cuenta Corriente',
  caja_ahorro: 'Caja de Ahorro'
};

// ========================================
// Constantes para Moneda
// ========================================
export const TIPO_MONEDA_LABELS: Record<TipoMoneda, string> = {
  ARS: 'Pesos Argentinos (ARS)',
  USD: 'Dólares (USD)'
};

// ========================================
// Helpers
// ========================================

/**
 * Formatea un CUIT en el formato XX-XXXXXXXX-X
 */
export function formatCUIT(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`;
  }
  return cuit;
}

/**
 * Valida el formato de un CUIT
 */
export function validarCUIT(cuit: string): boolean {
  const regex = /^\d{2}-?\d{8}-?\d{1}$/;
  return regex.test(cuit.replace(/\s/g, ''));
}

/**
 * Formatea un CBU (22 dígitos) en grupos de 4-4-14
 */
export function formatCBU(cbu: string): string {
  const cleaned = cbu.replace(/\D/g, '');
  if (cleaned.length === 22) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
  }
  return cbu;
}

/**
 * Valida el formato de un CBU (22 dígitos)
 */
export function validarCBU(cbu: string): boolean {
  const cleaned = cbu.replace(/\D/g, '');
  return cleaned.length === 22;
}

/**
 * Valida el formato de un CVU (22 dígitos)
 */
export function validarCVU(cvu: string): boolean {
  return validarCBU(cvu);  // Mismo formato que CBU
}

/**
 * Formatea el nombre completo de una persona
 */
export function formatPersonaNombre(persona: PersonaBasic): string {
  return `${persona.nombre} ${persona.apellido}`.trim();
}

/**
 * Obtiene el nombre del rol de una persona
 */
export function getRolLabel(rol: RolPersonaProveedor): string {
  return ROL_PERSONA_LABELS[rol] || rol;
}

/**
 * Obtiene las clases CSS para el badge de un rol
 */
export function getRolColor(rol: RolPersonaProveedor): string {
  return ROL_PERSONA_COLORS[rol] || ROL_PERSONA_COLORS.otro;
}