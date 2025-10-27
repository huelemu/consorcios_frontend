import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UnidadesService } from '../../services/unidades.service';
import { AuthService } from '../../../../auth/auth.service';
import { 
  UnidadFuncional, 
  ESTADO_UNIDAD_LABELS, 
  ESTADO_UNIDAD_COLORS,
  ESTADO_UNIDAD_ICONS 
} from '../../models/unidad.model';

/**
 * =========================================
 * UNIDAD DETAIL COMPONENT
 * =========================================
 * Vista detallada de una unidad funcional con toda su información
 * y personas relacionadas
 */
@Component({
  selector: 'app-unidad-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unidad-detail.component.html',
  styleUrls: ['./unidad-detail.component.scss']
})
export class UnidadDetailComponent implements OnInit {
  unidad: UnidadFuncional | null = null;
  unidadId: number | null = null;
  loading = false;
  error: string | null = null;

  // Permisos
  canEdit = false;
  canDelete = false;

  // Modales
  showDeleteModal = false;

  // Constantes para el template
  readonly ESTADO_LABELS = ESTADO_UNIDAD_LABELS;
  readonly ESTADO_COLORS = ESTADO_UNIDAD_COLORS;
  readonly ESTADO_ICONS = ESTADO_UNIDAD_ICONS;

  constructor(
    private unidadesService: UnidadesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.getUnidadIdFromRoute();
    if (this.unidadId) {
      this.loadUnidad();
    }
  }

  /**
   * Verificar permisos del usuario
   */
  checkPermissions(): void {
    this.canEdit = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin', 
      'admin_consorcio',
      'admin_edificio'
    ]);

    this.canDelete = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin'
    ]);
  }

  /**
   * Obtener ID de la unidad desde la ruta
   */
  getUnidadIdFromRoute(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.unidadId = +params['id'];
      }
    });
  }

  /**
   * Cargar datos completos de la unidad
   */
  loadUnidad(): void {
    if (!this.unidadId) return;

    this.loading = true;
    this.error = null;

    this.unidadesService.getUnidadById(this.unidadId).subscribe({
      next: (unidad) => {
        this.unidad = unidad;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar unidad:', err);
        this.error = 'Error al cargar los datos de la unidad.';
        this.loading = false;
      }
    });
  }

  /**
   * Navegar a editar
   */
  editarUnidad(): void {
    if (this.unidadId) {
      this.router.navigate(['/unidades', this.unidadId, 'editar']);
    }
  }

  /**
   * Mostrar modal de confirmación de eliminación
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
   * Eliminar unidad
   */
  eliminarUnidad(): void {
    if (!this.unidadId) return;

    this.loading = true;
    this.unidadesService.deleteUnidad(this.unidadId).subscribe({
      next: () => {
        this.router.navigate(['/unidades']);
      },
      error: (err) => {
        console.error('Error al eliminar unidad:', err);
        this.error = 'Error al eliminar la unidad. Por favor, intenta nuevamente.';
        this.loading = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Volver al listado
   */
  volver(): void {
    this.router.navigate(['/unidades']);
  }

  /**
   * Ver consorcio
   */
  verConsorcio(): void {
    if (this.unidad?.consorcio_id) {
      this.router.navigate(['/consorcios', this.unidad.consorcio_id]);
    }
  }

  /**
   * Ver persona
   */
  verPersona(personaId: number): void {
    this.router.navigate(['/personas', personaId]);
  }

  /**
   * Obtener clase de color según estado
   */
  getEstadoClass(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_COLORS[this.unidad.estado] || '';
  }

  /**
   * Obtener label del estado
   */
  getEstadoLabel(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_LABELS[this.unidad.estado] || '';
  }

  /**
   * Obtener icono del estado
   */
  getEstadoIcon(): string {
    if (!this.unidad) return '';
    return ESTADO_UNIDAD_ICONS[this.unidad.estado] || '🏠';
  }

  /**
   * Obtener label del rol de persona
   */
  getRolLabel(rol: string): string {
    const roles: { [key: string]: string } = {
      propietario: 'Propietario',
      inquilino: 'Inquilino',
      responsable: 'Responsable',
      otro: 'Otro'
    };
    return roles[rol] || rol;
  }

  /**
   * Obtener clase de color para el rol
   * ✅ CORREGIDO: Uso de notación de corchetes para acceso seguro
   */
  getRolClass(rol: string): string {
    const classes: { [key: string]: string } = {
      propietario: 'bg-blue-100 text-blue-800 border-blue-200',
      inquilino: 'bg-green-100 text-green-800 border-green-200',
      responsable: 'bg-purple-100 text-purple-800 border-purple-200',
      otro: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return classes[rol] || classes['otro']; // ✅ CORREGIDO
  }
}