import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para definir la estructura de un pedido en la vista del empleado.
 */
export interface PedidoCocina {
  id: string;
  platillo: string;
  estado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado';
  progreso: number;
}

/**
 * Componente: TableroKanbanComponent
 * Intención: Proporcionar una interfaz visual interactiva en formato Kanban para que los empleados gestionen el progreso de los pedidos.
 * Parámetros:
 *   - pedidos: PedidoCocina[] - Lista de pedidos activos en el sistema.
 * Retorno: Instancia de TableroKanbanComponent.
 * Casos límite:
 *   - Si la lista de pedidos está vacía, muestra mensajes amigables indicando que no hay pedidos en cada columna.
 *   - Valida transiciones permitidas en los botones antes de emitir cambios de estado.
 */
@Component({
  selector: 'app-tablero-kanban',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tablero-kanban.component.html'
})
export class TableroKanbanComponent {
  /**
   * Colección de pedidos recibida desde el componente padre.
   */
  @Input() pedidos: PedidoCocina[] = [];

  /**
   * Emisor de eventos para notificar cambios de estado en los pedidos al componente padre.
   */
  @Output() cambioEstado = new EventEmitter<{ id: string; nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }>();

  /**
   * Intención: Filtrar los pedidos correspondientes a una columna o estado específico.
   * Parámetros:
   *   - estado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' - El estado por el cual filtrar.
   * Retorno: PedidoCocina[] - Lista filtrada de pedidos.
   * Casos límite:
   *   - Si el estado proporcionado no es válido o la lista interna de pedidos es nula, retorna una lista vacía.
   */
  filtrarPedidos(estado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado'): PedidoCocina[] {
    if (!this.pedidos) {
      return [];
    }
    return this.pedidos.filter(pedido => pedido.estado === estado);
  }

  /**
   * Intención: Avanzar el estado de un pedido según la columna actual y notificar al padre.
   * Parámetros:
   *   - pedido: PedidoCocina - El pedido a procesar.
   * Retorno: void.
   * Casos límite:
   *   - Si el pedido ya está en estado "Entregado", no realiza ninguna acción.
   */
  avanzarEstado(pedido: PedidoCocina): void {
    if (pedido.estado === 'Nuevo') {
      this.cambioEstado.emit({ id: pedido.id, nuevoEstado: 'Preparando' });
    } else if (pedido.estado === 'Preparando') {
      this.cambioEstado.emit({ id: pedido.id, nuevoEstado: 'Listo' });
    } else if (pedido.estado === 'Listo') {
      this.cambioEstado.emit({ id: pedido.id, nuevoEstado: 'Entregado' });
    }
  }
}
