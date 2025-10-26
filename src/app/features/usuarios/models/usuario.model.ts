/**
 * =========================================
 * USUARIO MODEL
 * =========================================
 * Interfaces y tipos para el módulo de usuarios
 */

export type RolGlobal = 
  | 'admin_global'
  | 'tenant_admin'
  | 'admin_consorcio'
  | 'admin_edificio'
  | 'propietario'
  | 'inquilino'
  | 'proveedor';

export type OAuthProvider = 'local' | 'google' | 'microsoft';

/**
 * Interface principal de Usuario
 */
export interface Usuario {
  id: number;
  persona_id: number;
  username: string | null;
  email: string;
  password?: string; // No se devuelve desde el backend
  rol_global: RolGlobal;
  activo: boolean;
  
  // OAuth
  google_id?: string | null;
  oauth_provider: OAuthProvider;
  email_verificado: boolean;
  primer_login: boolean;
  
  // Invitación
  invitacion_token?: string | null;
  invitacion_expira?: Date | null;
  
  // Timestamps
  fecha_creacion: Date;
  
  // Relaciones
  persona?: PersonaBasic;
  roles?: UsuarioRol[];
}

/**
 * Información básica de la persona asociada
 */
export interface PersonaBasic {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  tipo_persona: 'fisica' | 'juridica';
}

/**
 * Roles específicos del usuario (con contexto)
 */
export interface UsuarioRol {
  id: number;
  usuario_id: number;
  rol_id: number;
  consorcio_id?: number | null;
  unidad_id?: number | null;
  activo: boolean;
  
  // Relaciones
  rol?: Rol;
  consorcio?: ConsorcioBasic;
  unidad?: UnidadBasic;
}

/**
 * Definición de un rol
 */
export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

/**
 * Información básica de consorcio
 */
export interface ConsorcioBasic {
  id: number;
  nombre: string;
  direccion: string;
}

/**
 * Información básica de unidad
 */
export interface UnidadBasic {
  id: number;
  codigo: string;
  consorcio_id: number;
}

/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUsuarioDto {
  persona_id: number;
  username?: string;
  email: string;
  password?: string;
  rol_global: RolGlobal;
  activo?: boolean;
  oauth_provider?: OAuthProvider;
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUsuarioDto {
  username?: string;
  email?: string;
  password?: string;
  rol_global?: RolGlobal;
  activo?: boolean;
  email_verificado?: boolean;
  primer_login?: boolean;
}

/**
 * DTO para asignar un rol específico
 */
export interface AsignarRolDto {
  usuario_id: number;
  rol_id: number;
  consorcio_id?: number;
  unidad_id?: number;
  activo?: boolean;
}

/**
 * Filtros para buscar usuarios
 */
export interface UsuarioFilters {
  search?: string;
  rol_global?: RolGlobal;
  activo?: boolean;
  oauth_provider?: OAuthProvider;
  email_verificado?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'fecha_creacion' | 'email' | 'username';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de usuarios
 */
export interface UsuariosResponse {
  usuarios: Usuario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Estadísticas de usuarios
 */
export interface UsuarioStats {
  total: number;
  activos: number;
  inactivos: number;
  porRol: {
    rol: RolGlobal;
    cantidad: number;
  }[];
  porProvider: {
    provider: OAuthProvider;
    cantidad: number;
  }[];
}

/**
 * Labels para los roles (para UI)
 */
export const ROL_LABELS: Record<RolGlobal, string> = {
  admin_global: 'Administrador Global',
  tenant_admin: 'Administrador de Tenant',
  admin_consorcio: 'Administrador de Consorcio',
  admin_edificio: 'Administrador de Edificio',
  propietario: 'Propietario',
  inquilino: 'Inquilino',
  proveedor: 'Proveedor'
};

/**
 * Colores para los roles (para badges)
 */
export const ROL_COLORS: Record<RolGlobal, string> = {
  admin_global: 'bg-purple-100 text-purple-800 border-purple-200',
  tenant_admin: 'bg-blue-100 text-blue-800 border-blue-200',
  admin_consorcio: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  admin_edificio: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  propietario: 'bg-green-100 text-green-800 border-green-200',
  inquilino: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  proveedor: 'bg-orange-100 text-orange-800 border-orange-200'
};

/**
 * Iconos para los roles
 */
export const ROL_ICONS: Record<RolGlobal, string> = {
  admin_global: '👑',
  tenant_admin: '🏢',
  admin_consorcio: '🏠',
  admin_edificio: '🏗️',
  propietario: '🏡',
  inquilino: '🚪',
  proveedor: '🔧'
};

/**
 * Labels para proveedores OAuth
 */
export const OAUTH_LABELS: Record<OAuthProvider, string> = {
  local: 'Local',
  google: 'Google',
  microsoft: 'Microsoft'
};

/**
 * Iconos para proveedores OAuth
 */
export const OAUTH_ICONS: Record<OAuthProvider, string> = {
  local: '🔑',
  google: '🔵',
  microsoft: '🟦'
};