import { ApplicationRef, ComponentRef, Injectable, Injector, Type, createComponent } from '@angular/core';
import { ModalBaseComponent } from '../modal-base/modal-base.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private appRef: ApplicationRef, private injector: Injector) {}

  open<T>(titulo: string, contenido: Type<T>, icono: string = 'edit', showFooter = true): Promise<any> {
    return new Promise(resolve => {
      const modalRef: ComponentRef<ModalBaseComponent> = createComponent(ModalBaseComponent, { environmentInjector: this.appRef.injector });
      modalRef.instance.titulo = titulo;
      modalRef.instance.icono = icono;
      modalRef.instance.contenido = contenido;

      modalRef.instance.cerrar.subscribe(() => this.close(modalRef, null, resolve));
      modalRef.instance.guardar.subscribe(() => this.close(modalRef, 'saved', resolve));

      document.body.appendChild(modalRef.location.nativeElement);
      this.appRef.attachView(modalRef.hostView);
    });
  }

  private close(modalRef: ComponentRef<ModalBaseComponent>, result: any, resolve: Function) {
    this.appRef.detachView(modalRef.hostView);
    modalRef.destroy();
    resolve(result);
  }
}
