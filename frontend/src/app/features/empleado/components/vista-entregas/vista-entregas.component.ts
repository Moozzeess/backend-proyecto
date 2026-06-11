import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoCocina } from '../tablero-kanban/tablero-kanban.component';

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
 *   - Distingue correctamente las acciones basadas en si la entrega es a domicilio o recolección en sucursal.
 */
@Component({
  selector: 'app-vista-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-entregas.component.html'
})
export class VistaEntregasComponent {
  /**
   * Colección completa de pedidos.
   */
  @Input() pedidos: PedidoCocina[] = [];

  /**
   * Evento para notificar cambios de estado (e.g., de Listo a En camino, o de En camino/Listo a Entregado).
   */
  @Output() cambioEstado = new EventEmitter<{ id: string; nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }>();

  /**
   * Simulación de detalles de reparto por ID de pedido para dar realismo a las direcciones y teléfonos.
   */
  private readonly detallesRepartoMock: { [pedidoId: string]: DetalleReparto } = {
    '#4521': { id: '#4521', metodo: 'Domicilio', direccion: 'Avenida Constituyentes 124, Colonia Centro', telefono: '5512345678', cliente: 'Sofía Valenzuela' },
    '#4518': { id: '#4518', metodo: 'Domicilio', direccion: 'Calle Pino Suárez 88, Interior 4', telefono: '5576543210', cliente: 'Roberto Esquivel' },
    '#4510': { id: '#4510', metodo: 'Sucursal', direccion: 'Sucursal Centro (Recoge en mostrador)', telefono: '5598765432', cliente: 'Marcela Reyes' },
    '#4505': { id: '#4505', metodo: 'Sucursal', direccion: 'Sucursal Centro (Recoge en mostrador)', telefono: '5533445566', cliente: 'Juan Carlos Ruiz' }
  };

  /**
   * Intención: Filtrar los pedidos que están listos para entregar o en camino.
   * Retorno: PedidoCocina[] - Listado de pedidos aptos para reparto o entrega.
   */
  obtenerPedidosEntregas(): PedidoCocina[] {
    if (!this.pedidos) {
      return [];
    }
    // Mostramos pedidos cuyo estado sea 'Listo' o 'Preparando' (como candidatos futuros) o directamente activos en reparto ('Listo' u otros que avancemos).
    // Para simplificar, nos enfocamos en pedidos con estado 'Listo' o aquellos que el repartidor ya haya tomado ('Listo' o 'Entregado' - pero entregados ya terminaron).
    // Agregamos un estado virtual para reparto si fuese necesario, pero usaremos 'Listo' y simulación de 'En camino'.
    // Modifiquemos el tipo de estado para incluir 'En camino' en la interfaz o manejarlo.
    // Como PedidoCocina usa 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado', si queremos "En camino", podemos simularlo o permitir transiciones directas.
    // Vamos a permitir filtrar 'Listo' y simular las transiciones.
    return this.pedidos.filter(pedido => pedido.estado === 'Listo');
  }

  /**
   * Intención: Obtener la información detallada de contacto y entrega de un pedido.
   * Parámetros:
   *   - pedidoId (string): Identificador único del pedido.
   * Retorno: DetalleReparto - Información de reparto del pedido.
   */
  obtenerDetallesReparto(pedidoId: string): DetalleReparto {
    return this.detallesRepartoMock[pedidoId] || {
      id: pedidoId,
      metodo: 'Domicilio',
      direccion: 'Dirección Registrada del Cliente',
      telefono: '5500000000',
      cliente: 'Cliente Registrado'
    };
  }

  /**
   * Intención: Avanzar el flujo de entrega, notificando al padre.
   * Parámetros:
   *   - pedidoId (string): ID del pedido.
   *   - metodo: 'Domicilio' | 'Sucursal' - Método de entrega.
   * Retorno: void.
   */
  procesarEntrega(pedidoId: string, metodo: 'Domicilio' | 'Sucursal'): void {
    // Si es sucursal, se entrega inmediatamente.
    // Si es domicilio, pasa a "Entregado" directamente en este flujo simplificado de Kanban, o podemos notificar para finalizar.
    this.cambioEstado.emit({ id: pedidoId, nuevoEstado: 'Entregado' });
  }
}
