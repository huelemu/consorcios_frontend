export interface Persona {
  id: number;
  nombre: string;
  apellido?: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  pais?: string;
  tipo_persona: 'fisica' | 'juridica';
  fecha_creacion: string;
}

export interface PersonaInput {
  nombre: string;
  apellido?: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  pais?: string;
  tipo_persona: 'fisica' | 'juridica';
}

export interface PersonasResponse {
  data: Persona[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PersonasStats {
  total: number;
  fisicas: number;
  juridicas: number;
  porProvincia: {
    provincia: string;
    cantidad: number;
  }[];
}

export interface PersonasFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipo_persona?: 'fisica' | 'juridica' | '';
  provincia?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}