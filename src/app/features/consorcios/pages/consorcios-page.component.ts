import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { ConsorcioFormComponent } from '../components/consorcio-form/consorcio-form.component';

@Component({
  selector: 'app-consorcios-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consorcios-page.component.html'
})
export class ConsorciosPageComponent {
  constructor(private modalService: ModalService) {}

  async nuevoConsorcio() {
    const result = await this.modalService.open('Nuevo Consorcio', ConsorcioFormComponent, 'building');
    if (result === 'saved') {
      console.log('Guardado con éxito');
      // acá refrescás la tabla de consorcios
    }
  }
}
