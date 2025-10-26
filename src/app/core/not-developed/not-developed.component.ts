import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-developed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md p-8">
        <div class="mb-6">
          <svg class="w-32 h-32 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          🚧 Módulo en Desarrollo
        </h2>
        
        <p class="text-gray-600 mb-6">
          Esta funcionalidad estará disponible próximamente.
          <br>Estamos trabajando para ofrecerte la mejor experiencia.
        </p>
        
        <button 
          (click)="goBack()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class NotDevelopedComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}