import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface Consorcio {
  id: number;
  nombre: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  unidadesFuncionales: number;
  cantidadPersonas: number;
  ticketsTotal: number;
  ticketsPendientes: number;
  estado: string;
}

interface ResumenGeneral {
  totalConsorcios: number;
  totalUnidades: number;
  totalPersonas: number;
  totalTicketsPendientes: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
   private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConsorcios(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/consorcios`).pipe(
    map((res) => {
      // Si viene { rows: [...] }, extraemos los datos
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.rows)) return res.rows;
      if (res && Array.isArray(res.data)) return res.data;
      // fallback vacío
      return [];
    })
  );
}

getUnidades(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/unidades`).pipe(
    map((res) => (Array.isArray(res) ? res : res.rows || res.data || []))
  );
}

getPersonas(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/personas`).pipe(
    map((res) => (Array.isArray(res) ? res : res.rows || res.data || []))
  );
}

getTickets(): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/tickets`).pipe(
    map((res) => (Array.isArray(res) ? res : res.rows || res.data || []))
  );
}


  getDatosDashboard(): Observable<{ consorcios: Consorcio[]; resumen: ResumenGeneral }> {
    return forkJoin({
      consorcios: this.getConsorcios(),
      unidades: this.getUnidades(),
      personas: this.getPersonas(),
      tickets: this.getTickets(),
    }).pipe(
      map(({ consorcios, unidades, personas, tickets }) => {
        const consorciosCompletos = consorcios.map(c => {
          const unidadesConsorcio = unidades.filter(u => u.consorcio_id === c.id);
          const personasConsorcio = personas.filter(p => p.consorcio_id === c.id);
          const ticketsConsorcio = tickets.filter(t => t.consorcio_id === c.id);
          const ticketsPendientes = ticketsConsorcio.filter(t => t.estado !== 'cerrado').length;

          return {
            ...c,
            unidadesFuncionales: unidadesConsorcio.length,
            cantidadPersonas: personasConsorcio.length,
            ticketsTotal: ticketsConsorcio.length,
            ticketsPendientes,
          };
        });

        const resumen: ResumenGeneral = {
          totalConsorcios: consorciosCompletos.length,
          totalUnidades: unidades.length,
          totalPersonas: personas.length,
          totalTicketsPendientes: tickets.filter(t => t.estado !== 'cerrado').length,
        };

        return { consorcios: consorciosCompletos, resumen };
      })
    );
  }
}
