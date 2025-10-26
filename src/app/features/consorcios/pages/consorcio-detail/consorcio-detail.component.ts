import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsorciosService } from '../../services/consorcios.service';
import { AuthService } from '../../../../auth/auth.service';
import {
  Consorcio,
  ESTADO_LABELS,
  ESTADO_COLORS,
  ESTADO_ICONS,
  getDireccionCompleta,
  getNombreResponsable
} from '../../models/consorcio.model';

/**
 * =========================================
 * CONSORCIO DETAIL COMPONENT
 * =========================================
 * Vista detallada de un consorcio específico
 */
@Component({
  selector: 'app-consorcio-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consorcio-detail.component.html',
  styleUrls: ['./consorcio-detail.component.scss']
})
export class ConsorcioDetailComponent implements OnInit {
  consorcio: Consorcio | null = null;
  loading: boolean = false;
  error: string = '';
  consorcioId: number | null = null;

  // Permisos
  canEdit: boolean = false;
  canDelete: boolean = false;

  // Constantes para el template
  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_COLORS = ESTADO_COLORS;
  readonly ESTADO_ICONS = ESTADO_ICONS;

  // Modales
  showDeleteModal: boolean = false;

  constructor(
    private consorciosService: ConsorciosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.getConsorcioIdFromRoute();
    this.loadConsorcio();
  }

  /**
   * Verificar permisos del usuario
   */
  checkPermissions(): void {
    this.canEdit = this.authService.hasAnyRole(['admin_global', 'tenant_admin', 'admin_consorcio']);
    this.canDelete = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
  }

  /**
   * Obtener ID del consorcio desde la ruta
   */
  getConsorcioIdFromRoute(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.consorcioId = parseInt(id);
    } else {
      this.error = 'ID de consorcio no válido';
      this.router.navigate(['/consorcios']);
    }
  }

  /**
   * Cargar datos del consorcio
   */
  loadConsorcio(): void {
    if (!this.consorcioId) return;

    this.loading = true;
    this.error = '';

    this.consorciosService.getConsorcioById(this.consorcioId).subscribe({
      next: (data) => {
        this.consorcio = data;
        this.loading = false;
        this.checkEditPermissions();
      },
      error: (error) => {
        console.error('Error al cargar consorcio:', error);
        this.error = error.error?.message || 'Error al cargar el consorcio';
        this.loading = false;
      }
    });
  }

  /**
   * Verificar permisos específicos para este consorcio
   */
  checkEditPermissions(): void {
    if (!this.consorcio) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.canEdit = false;
      this.canDelete = false;
      return;
    }

    // Admin global puede todo
    if (user.rol === 'admin_global') {
      this.canEdit = true;
      this.canDelete = true;
      return;
    }

    // Tenant admin solo sus consorcios
    if (user.rol === 'tenant_admin') {
      this.canEdit = this.consorcio.tenant_id === user.id;
      this.canDelete = this.consorcio.tenant_id === user.id;
      return;
    }

    // Admin consorcio solo si es responsable
    if (user.rol === 'admin_consorcio') {
      this.canEdit = this.consorcio.responsable_id === user.id;
      this.canDelete = false;
      return;
    }

    // Otros roles no pueden editar
    this.canEdit = false;
    this.canDelete = false;
  }

  /**
   * Volver a la lista
   */
  volver(): void {
    this.router.navigate(['/consorcios']);
  }

  /**
   * Ir a editar consorcio
   */
  editarConsorcio(): void {
    if (!this.consorcioId || !this.canEdit) return;
    this.router.navigate(['/consorcios', this.consorcioId, 'editar']);
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  confirmarEliminar(): void {
    this.showDeleteModal = true;
  }

  /**
   * Cancelar eliminación
   */
  cancelarEliminar(): void {
    this.showDeleteModal = false;
  }

  /**
   * Eliminar consorcio
   */
  eliminarConsorcio(): void {
    if (!this.consorcioId) return;

    this.loading = true;
    this.consorciosService.deleteConsorcio(this.consorcioId).subscribe({
      next: (response) => {
        console.log('Consorcio eliminado:', response.message);
        this.showDeleteModal = false;
        // Redirigir a la lista después de eliminar
        setTimeout(() => {
          this.router.navigate(['/consorcios']);
        }, 500);
      },
      error: (error) => {
        console.error('Error al eliminar consorcio:', error);
        this.error = error.error?.message || 'Error al eliminar el consorcio';
        this.loading = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Cambiar estado del consorcio (activar/desactivar)
   */
  toggleEstado(): void {
    if (!this.consorcio || !this.consorcioId) return;

    const action = this.consorcio.estado === 'activo' 
      ? this.consorciosService.desactivarConsorcio(this.consorcioId)
      : this.consorciosService.activarConsorcio(this.consorcioId);

    action.subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response.message);
        this.loadConsorcio(); // Recargar datos
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.error = error.error?.message || 'Error al cambiar el estado';
      }
    });
  }

  /**
   * Obtener dirección completa formateada
   */
  getDireccion(): string {
    if (!this.consorcio) return '';
    return getDireccionCompleta(this.consorcio);
  }

  /**
   * Obtener nombre del responsable
   */
  getResponsable(): string {
    if (!this.consorcio) return '';
    return getNombreResponsable(this.consorcio);
  }

  /**
   * Obtener email del responsable
   */
  getResponsableEmail(): string {
    if (!this.consorcio?.responsable) return 'Sin email';
    return this.consorcio.responsable.email || 'Sin email';
  }

  /**
   * Obtener teléfono del responsable
   */
  getResponsableTelefono(): string {
    if (!this.consorcio?.responsable?.persona) return 'Sin teléfono';
    return this.consorcio.responsable.persona.telefono || 'Sin teléfono';
  }

  /**
   * Obtener porcentaje de ocupación
   */
  getPorcentajeOcupacion(): number {
    if (!this.consorcio?.stats) return 0;
    const { totalUnidades, unidadesOcupadas } = this.consorcio.stats;
    if (totalUnidades === 0) return 0;
    return Math.round((unidadesOcupadas / totalUnidades) * 100);
  }

  /**
   * Obtener clase CSS para el badge de estado de unidad
   */
  getUnidadEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'ocupado': 'bg-green-100 text-green-800 border-green-200',
      'vacante': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'mantenimiento': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return classes[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  /**
   * Obtener label para el estado de unidad
   */
  getUnidadEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'ocupado': 'Ocupado',
      'vacante': 'Vacante',
      'mantenimiento': 'Mantenimiento'
    };
    return labels[estado] || estado;
  }

  /**
   * Navegar a la gestión de unidades (próximo a implementar)
   */
  gestionarUnidades(): void {
    // TODO: Implementar cuando esté el módulo de unidades
    console.log('Gestionar unidades del consorcio:', this.consorcioId);
    alert('Funcionalidad de gestión de unidades próximamente');
  }

  /**
   * Verificar si hay datos de contacto
   */
  hasDatosContacto(): boolean {
    if (!this.consorcio) return false;
    return !!(
      this.consorcio.telefono_contacto || 
      this.consorcio.email_contacto
    );
  }

  /**
   * Verificar si hay responsable asignado
   */
  hasResponsable(): boolean {
    return !!(this.consorcio?.responsable);
  }

  /**
   * Verificar si hay unidades
   */
  hasUnidades(): boolean {
    return !!(this.consorcio?.unidades && this.consorcio.unidades.length > 0);
  }
}