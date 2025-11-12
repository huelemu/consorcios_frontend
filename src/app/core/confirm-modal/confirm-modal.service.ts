import { Injectable, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmModalComponent } from './confirm-modal.component';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: 'warning' | 'trash' | 'check' | 'info' | 'key' | 'user-toggle';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // Crear el componente dinámicamente
      const componentRef = createComponent(ConfirmModalComponent, {
        environmentInjector: this.injector
      });

      // Configurar inputs
      const instance = componentRef.instance;
      instance.title = options.title || '¿Confirmar acción?';
      instance.message = options.message;
      instance.confirmText = options.confirmText || 'Confirmar';
      instance.cancelText = options.cancelText || 'Cancelar';
      instance.type = options.type || 'warning';
      instance.icon = options.icon || 'warning';

      // Manejar eventos
      const cleanup = () => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      instance.confirm.subscribe(() => {
        cleanup();
        resolve(true);
      });

      instance.cancel.subscribe(() => {
        cleanup();
        resolve(false);
      });

      // Adjuntar al DOM
      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  // Métodos de conveniencia
  confirmDelete(message: string, title?: string): Promise<boolean> {
    return this.confirm({
      title: title || '¿Eliminar elemento?',
      message,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash'
    });
  }

  confirmDeactivate(entityName: string): Promise<boolean> {
    return this.confirm({
      title: '¿Desactivar?',
      message: `¿Está seguro de que desea desactivar ${entityName}?`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: 'user-toggle'
    });
  }

  confirmActivate(entityName: string): Promise<boolean> {
    return this.confirm({
      title: '¿Activar?',
      message: `¿Está seguro de que desea activar ${entityName}?`,
      confirmText: 'Activar',
      cancelText: 'Cancelar',
      type: 'success',
      icon: 'check'
    });
  }

  confirmResetPassword(username: string): Promise<boolean> {
    return this.confirm({
      title: '¿Resetear contraseña?',
      message: `Se enviará un email a ${username} con instrucciones para resetear su contraseña.`,
      confirmText: 'Enviar email',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: 'key'
    });
  }
}
