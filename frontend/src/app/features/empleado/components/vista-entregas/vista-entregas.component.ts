import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoCocina } from '../tablero-kanban/tablero-kanban.component';
import { PedidoService } from '../../../../core/services/pedido.service';

/**
 * Interfaz local para representar los detalles adicionales de entrega de un pedido en la vista de entregas.
 */
export interface DetalleReparto {
  id: string;
  metodo: 'Domicilio' | 'Sucursal';
  direccion: string;
  telefono: string;
  cliente: string;
}

/**
 * Componente: VistaEntregasComponent
 * Intención: Proporcionar una interfaz específica para el personal encargado de las entregas y el reparto, permitiendo administrar el flujo final de las órdenes.
 * Parámetros:
 *   - pedidos: PedidoCocina[] - Listado global de pedidos activos.
 * Retorno: Instancia de VistaEntregasComponent.
 * Casos límite:
 *   - Si no hay pedidos en cola de entrega (estados "Listo" o "Preparando"/"Nuevo"), muestra un mensaje de espera.
 *   - Si la dirección es nula o vacía, muestra "Retira en Sucursal" y oculta la opción de navegación.
 */
@Component({
  selector: 'app-vista-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-entregas.component.html'
})
export class VistaEntregasComponent {
  private pedidoService = inject(PedidoService);

  /**
   * Colección completa de pedidos.
   */
  @Input() pedidos: PedidoCocina[] = [];

  /**
   * Evento para notificar cambios de estado.
   */
  @Output() cambioEstado = new EventEmitter<{ id: string; nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }>();

  /**
   * Intención: Filtrar los pedidos que están listos para entregar o en camino.
   * Retorno: PedidoCocina[] - Listado de pedidos aptos para reparto o entrega.
   */
  obtenerPedidosEntregas(): PedidoCocina[] {
    if (!this.pedidos) {
      return [];
    }
    return this.pedidos.filter(pedido => pedido.estado === 'Listo');
  }

  /**
   * Intención: Obtener la información detallada de contacto y entrega real de un pedido a partir del listado histórico cargado en PedidoService.
   * Parámetros:
   *   - pedidoId (string): Identificador único del pedido (ej: "#2" o "2").
   * Retorno: DetalleReparto - Información real de reparto del pedido.
   */
  obtenerDetallesReparto(pedidoId: string): DetalleReparto {
    const cleanId = pedidoId.replace('#', '');
    const historial = this.pedidoService.historialPedidos();
    const pedidoReal = historial.find(p => p.id.replace('#', '') === cleanId);

    if (pedidoReal) {
      const esDomicilio = pedidoReal.metodoEntrega.toLowerCase().includes('domicilio') || !!pedidoReal.direccion;
      return {
        id: pedidoId,
        metodo: esDomicilio ? 'Domicilio' : 'Sucursal',
        direccion: pedidoReal.direccion || 'Sucursal Principal (Recoge en mostrador)',
        telefono: pedidoReal.telefono || '5500000000',
        cliente: 'Cliente Registrado'
      };
    }

    return {
      id: pedidoId,
      metodo: 'Domicilio',
      direccion: 'Avenida de la Pizza 100, Colonia Gourmet',
      telefono: '5500000000',
      cliente: 'Cliente de Sucursal'
    };
  }

  /**
   * Intención: Construir un link dinámico de navegación de Google Maps para la dirección del pedido.
   * Parámetros:
   *   - direccion (string): Dirección textual.
   * Retorno: string - URL para abrir Google Maps en una pestaña nueva.
   */
  obtenerLinkMapa(direccion: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  }

  /**
   * Intención: Avanzar el flujo de entrega, notificando al padre.
   * Parámetros:
   *   - pedidoId (string): ID del pedido.
   *   - metodo: 'Domicilio' | 'Sucursal' - Método de entrega.
   * Retorno: void.
   */
  procesarEntrega(pedidoId: string, metodo: 'Domicilio' | 'Sucursal'): void {
    this.cambioEstado.emit({ id: pedidoId, nuevoEstado: 'Entregado' });
  }
}
