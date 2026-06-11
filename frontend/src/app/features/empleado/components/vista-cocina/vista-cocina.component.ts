import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoCocina } from '../tablero-kanban/tablero-kanban.component';

/**
 * Componente: VistaCocinaComponent
 * Intención: Proporcionar a los cocineros del negocio una vista enfocada únicamente en la preparación de alimentos con listas de verificación de ingredientes.
 * Parámetros:
 *   - pedidos: PedidoCocina[] - Lista de todos los pedidos activos.
 * Retorno: Instancia de VistaCocinaComponent.
 * Casos límite:
 *   - Si no hay pedidos en estado "Preparando", se muestra una advertencia informativa.
 *   - Controla de forma reactiva el estado de marcado de los ingredientes para cada pizza de forma individual.
 */
@Component({
  selector: 'app-vista-cocina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-cocina.component.html'
})
export class VistaCocinaComponent {
  /**
   * Colección completa de pedidos.
   */
  @Input() pedidos: PedidoCocina[] = [];

  /**
   * Evento para notificar al padre cuando el pedido se marca como listo.
   */
  @Output() marcarListo = new EventEmitter<string>();

  /**
   * Estado de verificación local para los ingredientes de cada pedido en preparación.
   */
  checklistIngredientes: { [pedidoId: string]: { [ingrediente: string]: boolean } } = {};

  /**
   * Catálogo simulado de ingredientes de acuerdo al tipo de pizza.
   */
  private readonly ingredientesPorPlatillo: { [platillo: string]: string[] } = {
    'Pepperoni Familiar': ['Queso Mozzarella', 'Pepperoni', 'Salsa de Tomate', 'Masa'],
    'Mexicana Grande': ['Queso Mozzarella', 'Chorizo', 'Jalapeños', 'Frijoles Refritos', 'Masa'],
    'Hawaiana Familiar': ['Queso Mozzarella', 'Jamón York', 'Piña Caramelizada', 'Salsa de Tomate', 'Masa'],
    'Cuatro Quesos': ['Queso Mozzarella', 'Queso Azul', 'Queso Parmesano', 'Queso Provolone', 'Salsa de Tomate', 'Masa']
  };

  /**
   * Intención: Filtrar los pedidos que se encuentran actualmente en cocina (estado "Preparando").
   * Retorno: PedidoCocina[] - Listado de pedidos listos para preparar.
   */
  obtenerPedidosEnCocina(): PedidoCocina[] {
    if (!this.pedidos) {
      return [];
    }
    return this.pedidos.filter(pedido => pedido.estado === 'Preparando');
  }

  /**
   * Intención: Obtener los ingredientes requeridos para un platillo específico.
   * Parámetros:
   *   - platillo (string): Nombre de la pizza u orden.
   * Retorno: string[] - Lista de ingredientes.
   */
  obtenerIngredientes(platillo: string): string[] {
    return this.ingredientesPorPlatillo[platillo] || ['Queso Mozzarella', 'Salsa de Tomate', 'Masa'];
  }

  /**
   * Intención: Verificar si un ingrediente específico ha sido marcado para un pedido en particular.
   * Parámetros:
   *   - pedidoId (string): Identificador único del pedido.
   *   - ingrediente (string): Nombre del ingrediente.
   * Retorno: boolean - Verdadero si está marcado, falso en caso contrario.
   */
  estaMarcado(pedidoId: string, ingrediente: string): boolean {
    if (!this.checklistIngredientes[pedidoId]) {
      this.checklistIngredientes[pedidoId] = {};
    }
    return !!this.checklistIngredientes[pedidoId][ingrediente];
  }

  /**
   * Intención: Alternar el estado de verificación de un ingrediente.
   * Parámetros:
   *   - pedidoId (string): Identificador único del pedido.
   *   - ingrediente (string): Nombre del ingrediente.
   * Retorno: void.
   */
  alternarIngrediente(pedidoId: string, ingrediente: string): void {
    if (!this.checklistIngredientes[pedidoId]) {
      this.checklistIngredientes[pedidoId] = {};
    }
    this.checklistIngredientes[pedidoId][ingrediente] = !this.checklistIngredientes[pedidoId][ingrediente];
  }

  /**
   * Intención: Comprobar si todos los ingredientes de un pedido ya han sido marcados.
   * Parámetros:
   *   - pedido (PedidoCocina): Instancia del pedido en cuestión.
   * Retorno: boolean - Verdadero si el checklist está completo.
   */
  estaCompleto(pedido: PedidoCocina): boolean {
    const ingredientes = this.obtenerIngredientes(pedido.platillo);
    return ingredientes.every(ing => this.estaMarcado(pedido.id, ing));
  }

  /**
   * Intención: Notificar al componente padre que la preparación ha concluido con éxito.
   * Parámetros:
   *   - pedidoId (string): Identificador del pedido.
   * Retorno: void.
   */
  finalizarPreparacion(pedidoId: string): void {
    this.marcarListo.emit(pedidoId);
  }
}
