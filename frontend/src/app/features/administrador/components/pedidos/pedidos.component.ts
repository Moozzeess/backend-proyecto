import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, PedidoHistorico } from '../../../../core/services/pedido.service';

/**
 * Componente: PedidosComponent
 * Intención: Proveer visualización del listado de pedidos y posibilitar la edición de su estatus.
 * Retorno: Instancia de PedidosComponent.
 */
@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html'
})
export class PedidosComponent {
  public servicioPedidos = inject(PedidoService);
  
  @Output() solicitarFactura = new EventEmitter<PedidoHistorico>();
  @Output() exitoAlerta = new EventEmitter<string>();

  actualizarEstadoPedido(pedidoId: string, nuevoEstado: string): void {
    const pedidos = this.servicioPedidos.historialPedidos();
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      const historialModificado = pedidos.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p);
      this.servicioPedidos.historialPedidos.set(historialModificado);
      this.exitoAlerta.emit(`El pedido ${pedidoId} ahora está: ${nuevoEstado}.`);
    }
  }

  facturar(pedido: PedidoHistorico): void {
    this.solicitarFactura.emit(pedido);
  }
}
