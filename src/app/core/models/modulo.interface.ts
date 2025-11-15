/**
 * Interfaz para representar un módulo del sistema
 */
export interface Modulo {
  id: number;
  nombre: string;
  clave: string;
  descripcion?: string;
  icono: string;
  ruta: string;
  orden: number;
  activo: boolean;
  requiere_consorcio: boolean;
  created_at?: string;
  updated_at?: string;
  modulo_roles?: ModuloRol[];
}

/**
 * Interfaz para los permisos de un módulo por rol
 */
export interface ModuloRol {
  id?: number;
  rol_id?: number;
  modulo_id?: number;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
}

/**
 * Interfaz para la respuesta del endpoint /modulos/mis-modulos
 */
export interface MisModulosResponse {
  success: boolean;
  rol: string;
  count: number;
  data: Modulo[];
}

/**
 * Interfaz para representar un módulo con permisos simplificados
 * Útil para el manejo en el frontend
 */
export interface ModuloConPermisos {
  id: number;
  nombre: string;
  clave: string;
  icono: string;
  ruta: string;
  orden: number;
  requiere_consorcio: boolean;
  permisos: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
  };
}
