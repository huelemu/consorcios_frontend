import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Persona,
  PersonaInput,
  PersonasResponse,
  PersonasStats,
  PersonasFilters
} from '../models/persona.model';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las personas con filtros y paginación
   */
  getPersonas(filters: PersonasFilters = {}): Observable<PersonasResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.tipo_persona) params = params.set('tipo_persona', filters.tipo_persona);
    if (filters.provincia) params = params.set('provincia', filters.provincia);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<PersonasResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener una persona por ID
   */
  getPersonaById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/${id}`);
  }

  /**
   * Búsqueda rápida de personas
   */
  searchPersonas(query: string): Observable<Persona[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Persona[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Obtener estadísticas de personas
   */
  getStats(): Observable<PersonasStats> {
    return this.http.get<PersonasStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Crear una nueva persona
   */
  createPersona(persona: PersonaInput): Observable<{ message: string; data: Persona }> {
    return this.http.post<{ message: string; data: Persona }>(this.apiUrl, persona);
  }

  /**
   * Actualizar una persona existente
   */
  updatePersona(id: number, persona: Partial<PersonaInput>): Observable<{ message: string; data: Persona }> {
    return this.http.put<{ message: string; data: Persona }>(`${this.apiUrl}/${id}`, persona);
  }

  /**
   * Eliminar una persona
   */
  deletePersona(id: number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener iniciales de una persona para el avatar
   */
  getInitials(persona: Persona): string {
    const nombre = persona.nombre?.charAt(0).toUpperCase() || '';
    const apellido = persona.apellido?.charAt(0).toUpperCase() || '';
    return `${nombre}${apellido}`;
  }

  /**
   * Obtener nombre completo de una persona
   */
  getFullName(persona: Persona): string {
    return `${persona.nombre} ${persona.apellido || ''}`.trim();
  }
}