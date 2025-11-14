import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Tipo de notificación
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'action';

/**
 * Prioridad de la notificación
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Interface de Notificación
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actionText?: string;
  actionRoute?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

/**
 * Servicio centralizado de notificaciones
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotificationsFromStorage();
  }

  /**
   * Obtener todas las notificaciones
   */
  getAll(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Obtener notificaciones no leídas
   */
  getUnread(): AppNotification[] {
    return this.notificationsSubject.value.filter(n => !n.read);
  }

  /**
   * Obtener notificaciones que requieren acción
   */
  getActionRequired(): AppNotification[] {
    return this.notificationsSubject.value.filter(n => n.actionRequired && !n.read);
  }

  /**
   * Agregar una nueva notificación
   */
  add(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const notifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Eliminar una notificación
   */
  remove(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Eliminar todas las notificaciones
   */
  clear(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Eliminar notificaciones leídas
   */
  clearRead(): void {
    const notifications = this.notificationsSubject.value.filter(n => !n.read);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Notificaciones de sistema predefinidas
   */
  notifyNewUserPending(userName: string, userEmail: string, userId: number): void {
    this.add({
      type: 'action',
      priority: 'high',
      title: 'Nuevo usuario pendiente de aprobación',
      message: `${userName} (${userEmail}) se ha registrado y requiere aprobación.`,
      actionRequired: true,
      actionText: 'Revisar y aprobar',
      actionRoute: '/configuracion/permisos',
      icon: '👤',
      metadata: { userId, userName, userEmail }
    });
  }

  notifyUserApproved(): void {
    this.add({
      type: 'success',
      priority: 'medium',
      title: '¡Cuenta aprobada!',
      message: 'Tu cuenta ha sido aprobada por un administrador. Ya puedes acceder a la aplicación.',
      icon: '✅'
    });
  }

  notifyUserRejected(): void {
    this.add({
      type: 'error',
      priority: 'high',
      title: 'Cuenta no aprobada',
      message: 'Tu solicitud de acceso no ha sido aprobada. Contacta al administrador.',
      icon: '❌'
    });
  }

  notifyPermissionsChanged(changedBy: string): void {
    this.add({
      type: 'info',
      priority: 'medium',
      title: 'Permisos actualizados',
      message: `Tus permisos han sido modificados por ${changedBy}.`,
      icon: '🔑'
    });
  }

  notifyRoleChanged(newRole: string): void {
    this.add({
      type: 'info',
      priority: 'high',
      title: 'Rol actualizado',
      message: `Tu rol ha sido cambiado a: ${newRole}`,
      icon: '🎭'
    });
  }

  /**
   * Genera un ID único para la notificación
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Actualiza el contador de no leídas
   */
  private updateUnreadCount(): void {
    const count = this.getUnread().length;
    this.unreadCountSubject.next(count);
  }

  /**
   * Guardar notificaciones en localStorage
   */
  private saveNotificationsToStorage(): void {
    try {
      const notifications = this.notificationsSubject.value;
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error guardando notificaciones:', error);
    }
  }

  /**
   * Cargar notificaciones desde localStorage
   */
  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_notifications');
      if (stored) {
        const notifications: AppNotification[] = JSON.parse(stored);
        // Convertir timestamps de string a Date
        const parsedNotifications = notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(parsedNotifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  }
}
