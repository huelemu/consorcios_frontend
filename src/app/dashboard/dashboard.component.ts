import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  consorcios: Consorcio[] = [];
  resumen: ResumenGeneral = {
    totalConsorcios: 0,
    totalUnidades: 0,
    totalPersonas: 0,
    totalTicketsPendientes: 0
  };
  loading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarConsorcios();
  }

  /**
   * Carga los datos de los consorcios
   * TODO: Reemplazar con llamada real al backend cuando esté disponible
   */
  cargarConsorcios(): void {
    // Simular carga de datos
    setTimeout(() => {
      // Datos mock - Reemplazar con servicio real
      const mockData: Consorcio[] = [
        {
          id: 1,
          nombre: 'Edificio Libertad',
          direccion: 'Libertad 1200',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 24,
          cantidadPersonas: 68,
          ticketsTotal: 15,
          ticketsPendientes: 3,
          estado: 'activo'
        },
        {
          id: 2,
          nombre: 'Torre Central',
          direccion: 'Av. Corrientes 3500',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 48,
          cantidadPersonas: 142,
          ticketsTotal: 8,
          ticketsPendientes: 0,
          estado: 'activo'
        },
        {
          id: 3,
          nombre: 'Complejo Almagro',
          direccion: 'Av. Díaz Vélez 4200',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 36,
          cantidadPersonas: 95,
          ticketsTotal: 22,
          ticketsPendientes: 7,
          estado: 'activo'
        },
        {
          id: 4,
          nombre: 'Residencial Palermo',
          direccion: 'Costa Rica 5800',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 18,
          cantidadPersonas: 52,
          ticketsTotal: 5,
          ticketsPendientes: 0,
          estado: 'activo'
        },
        {
          id: 5,
          nombre: 'Edificio Belgrano',
          direccion: 'Av. Cabildo 2100',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 30,
          cantidadPersonas: 85,
          ticketsTotal: 12,
          ticketsPendientes: 1,
          estado: 'activo'
        },
        {
          id: 6,
          nombre: 'Torres del Parque',
          direccion: 'Av. del Libertador 8900',
          ciudad: 'CABA',
          provincia: 'Buenos Aires',
          unidadesFuncionales: 60,
          cantidadPersonas: 175,
          ticketsTotal: 18,
          ticketsPendientes: 5,
          estado: 'activo'
        }
      ];

      // Ordenar: primero los que tienen tickets pendientes
      this.consorcios = this.ordenarConsorcios(mockData);
      this.calcularResumen();
      this.loading = false;
    }, 800);
  }

  /**
   * Ordena los consorcios: primero los que tienen tickets pendientes
   */
  ordenarConsorcios(consorcios: Consorcio[]): Consorcio[] {
    return consorcios.sort((a, b) => {
      // Primero los que tienen tickets pendientes
      if (a.ticketsPendientes > 0 && b.ticketsPendientes === 0) return -1;
      if (a.ticketsPendientes === 0 && b.ticketsPendientes > 0) return 1;
      // Si ambos tienen tickets pendientes, ordenar por cantidad descendente
      if (a.ticketsPendientes > 0 && b.ticketsPendientes > 0) {
        return b.ticketsPendientes - a.ticketsPendientes;
      }
      // Si ninguno tiene tickets pendientes, ordenar alfabéticamente
      return a.nombre.localeCompare(b.nombre);
    });
  }

  /**
   * Calcula el resumen general de todos los consorcios
   */
  calcularResumen(): void {
    this.resumen = {
      totalConsorcios: this.consorcios.length,
      totalUnidades: this.consorcios.reduce((sum, c) => sum + c.unidadesFuncionales, 0),
      totalPersonas: this.consorcios.reduce((sum, c) => sum + c.cantidadPersonas, 0),
      totalTicketsPendientes: this.consorcios.reduce((sum, c) => sum + c.ticketsPendientes, 0)
    };
  }

  /**
   * Verifica si un consorcio tiene tickets pendientes
   */
  tienePendientes(consorcio: Consorcio): boolean {
    return consorcio.ticketsPendientes > 0;
  }

  /**
   * Navega al detalle de un consorcio
   */
  verDetalle(consorcioId: number): void {
    // TODO: Implementar cuando esté disponible la ruta de detalle
    console.log('Navegar a consorcio:', consorcioId);
    this.router.navigate(['/consorcios', consorcioId]);
  }

  /**
   * Obtiene la dirección completa formateada
   */
  getDireccionCompleta(consorcio: Consorcio): string {
    const partes = [consorcio.direccion];
    if (consorcio.ciudad) partes.push(consorcio.ciudad);
    return partes.join(', ');
  }

  /**
   * Obtiene el texto del badge de alerta
   */
  getTextoAlerta(cantidad: number): string {
    return cantidad === 1 
      ? '¡1 ticket pendiente!' 
      : `¡${cantidad} tickets pendientes!`;
  }
}