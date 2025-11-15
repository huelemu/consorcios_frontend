import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { ModulosService } from '../services/modulos.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según permisos
 *
 * Uso:
 * <button *hasPermission="'consorcios:crear'">Crear Consorcio</button>
 * <button *hasPermission="'personas:editar'">Editar</button>
 * <button *hasPermission="'tickets:eliminar'">Eliminar</button>
 * <div *hasPermission="'dashboard:ver'">Dashboard completo</div>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private permission: string = '';

  @Input()
  set hasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private modulosService: ModulosService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    if (!this.permission) {
      // Si no hay permiso especificado, no mostrar nada
      this.viewContainer.clear();
      return;
    }

    const hasPermission = this.checkPermission(this.permission);

    if (hasPermission) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }

  private checkPermission(permission: string): boolean {
    // Formato esperado: "modulo:accion"
    // Ejemplo: "consorcios:crear", "personas:editar", "tickets:eliminar"
    const [modulo, accion] = permission.split(':');

    if (!modulo || !accion) {
      console.warn(`Formato de permiso inválido: ${permission}. Use "modulo:accion"`);
      return false;
    }

    switch (accion.toLowerCase()) {
      case 'ver':
        return this.modulosService.puedeVer(modulo);
      case 'crear':
        return this.modulosService.puedeCrear(modulo);
      case 'editar':
        return this.modulosService.puedeEditar(modulo);
      case 'eliminar':
        return this.modulosService.puedeEliminar(modulo);
      default:
        console.warn(`Acción desconocida: ${accion}. Use: ver, crear, editar, eliminar`);
        return false;
    }
  }
}
