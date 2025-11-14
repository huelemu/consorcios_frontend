import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificationsService,
  AppNotification,
  NotificationType
} from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: AppNotification[] = [];
  unreadCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a las notificaciones
    this.notificationsService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // Suscribirse al contador de no leídas
    this.notificationsService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Alternar el panel de notificaciones
   */
  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Cerrar el panel
   */
  closePanel(): void {
    this.isOpen = false;
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(notification: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationsService.markAsRead(notification.id);
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  /**
   * Eliminar una notificación
   */
  removeNotification(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notificationsService.remove(notification.id);
  }

  /**
   * Limpiar todas las notificaciones leídas
   */
  clearRead(): void {
    this.notificationsService.clearRead();
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsService.clear();
    this.closePanel();
  }

  /**
   * Manejar clic en una notificación
   */
  onNotificationClick(notification: AppNotification): void {
    // Marcar como leída
    if (!notification.read) {
      this.markAsRead(notification);
    }

    // Si tiene acción, navegar
    if (notification.actionRoute) {
      this.router.navigate([notification.actionRoute]);
      this.closePanel();
    }
  }

  /**
   * Obtener clase CSS según el tipo de notificación
   */
  getNotificationTypeClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      action: 'bg-purple-50 border-purple-200'
    };
    return classes[type] || 'bg-gray-50 border-gray-200';
  }

  /**
   * Obtener clase CSS del ícono según el tipo
   */
  getNotificationIconClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      action: 'text-purple-600'
    };
    return classes[type] || 'text-gray-600';
  }

  /**
   * Obtener ícono según el tipo de notificación
   */
  getDefaultIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      action: '🔔'
    };
    return icons[type] || '📬';
  }

  /**
   * Formatear timestamp de forma relativa
   */
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    return new Date(date).toLocaleDateString('es-AR');
  }

  /**
   * Obtener solo las últimas 5 notificaciones para mostrar
   */
  get recentNotifications(): AppNotification[] {
    return this.notifications.slice(0, 5);
  }

  /**
   * Verificar si hay más notificaciones
   */
  get hasMoreNotifications(): boolean {
    return this.notifications.length > 5;
  }
}
