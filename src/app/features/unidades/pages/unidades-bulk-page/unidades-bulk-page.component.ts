// src/app/features/unidades/pages/unidades-bulk-page/unidades-bulk-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnidadesBulkCreateComponent } from '../../components/unidades-bulk-create/unidades-bulk-create.component';

@Component({
  selector: 'app-unidades-bulk-page',
  standalone: true,
  imports: [CommonModule, UnidadesBulkCreateComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <button 
          (click)="volver()"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition">
          <span>←</span>
          <span>Volver</span>
        </button>

        <div class="bg-white rounded-lg shadow-sm">
          <app-unidades-bulk-create 
            (close)="onClose($event)">
          </app-unidades-bulk-create>
        </div>
      </div>
    </div>
  `
})
export class UnidadesBulkPageComponent {
  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/unidades']);
  }

  onClose(recarga: boolean) {
    if (recarga) {
      this.router.navigate(['/unidades']);
    }
  }
}