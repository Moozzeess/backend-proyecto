import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para la representación de notificaciones del sistema en la vista del empleado.
 */
export interface AlertaNotificacion {
  id: string;
  tipo: 'alerta' | 'exito' | 'informacion';
  mensaje: string;
  fechaHora: string;
}

/**
 * Componente: VistaNotificacionesComponent
 * Intención: Proveer un centro de mensajes y alertas en tiempo real para que los empleados se enteren de cambios en el inventario o nuevos pedidos.
 * Parámetros:
 *   - notificaciones: AlertaNotificacion[] - Lista de notificaciones vigentes.
 * Retorno: Instancia de VistaNotificacionesComponent.
 * Casos límite:
 *   - Si la lista de notificaciones está vacía, muestra un mensaje amigable indicando que no hay alertas pendientes.
 */
@Component({
  selector: 'app-vista-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-notificaciones.component.html'
})
export class VistaNotificacionesComponent {
  /**
   * Colección de notificaciones activas.
   */
  @Input() notificaciones: AlertaNotificacion[] = [];

  /**
   * Emisor de eventos para eliminar una notificación en específico.
   */
  @Output() descartarNotificacion = new EventEmitter<string>();

  /**
   * Emisor de eventos para limpiar todo el historial de alertas.
   */
  @Output() limpiarTodo = new EventEmitter<void>();

  /**
   * Intención: Emitir el ID de la notificación que se desea descartar.
   * Parámetros:
   *   - id (string): Identificador único de la notificación.
   * Retorno: void.
   */
  descartar(id: string): void {
    this.descartarNotificacion.emit(id);
  }

  /**
   * Intención: Emitir el evento de limpieza total.
   * Retorno: void.
   */
  limpiar(): void {
    this.limpiarTodo.emit();
  }
}
