import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastType } from './toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private show(message: string, type: ToastType, title?: string, duration: number = 5000): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      title,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove después de la duración especificada
    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string, title?: string, duration?: number): void {
    this.show(message, 'success', title || 'Éxito', duration);
  }

  error(message: string, title?: string, duration?: number): void {
    this.show(message, 'error', title || 'Error', duration);
  }

  warning(message: string, title?: string, duration?: number): void {
    this.show(message, 'warning', title || 'Advertencia', duration);
  }

  info(message: string, title?: string, duration?: number): void {
    this.show(message, 'info', title || 'Información', duration);
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
