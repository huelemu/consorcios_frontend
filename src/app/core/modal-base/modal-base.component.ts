import { Component, EventEmitter, Injector, Input, Output, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalHeaderComponent } from '../modal-header/modal-header.component';

@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [CommonModule, ModalHeaderComponent],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <app-modal-header
          [title]="titulo"
          [icon]="icono"
          (close)="cerrarModal()">
        </app-modal-header>

        <div class="modal-body">
          <ng-container *ngComponentOutlet="contenido; injector: injector"></ng-container>
        </div>

        <div class="modal-footer">
          <button (click)="onGuardar()" class="btn btn-primary">Guardar</button>
          <button (click)="cerrarModal()" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal-base.component.scss']
})
export class ModalBaseComponent {
  @Input() titulo!: string;
  @Input() icono: string = 'home';
  @Input() contenido!: Type<any>;
  @Output() guardar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  constructor(public injector: Injector) {}

  onGuardar() { this.guardar.emit(); }
  cerrarModal() { this.cerrar.emit(); }
}
