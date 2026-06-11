import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficaComponent } from '../../../../shared/components/grafica/grafica.component';
import { PedidoService, CorteCaja } from '../../../../core/services/pedido.service';

/**
 * Componente: DashboardComponent
 * Intención: Presentar la vista de KPIs financieros diarios (ventas, pedidos, clientes y ticket promedio), la gráfica semanal y la auditoría de cortes de caja diarios enviados por empleados.
 * Parámetros:
 *   - ventasHoyPesos: number - Monto total vendido en el día.
 *   - cantidadPedidos: number - Cantidad de pedidos realizados hoy.
 * Retorno: Instancia de DashboardComponent.
 * Casos límite:
 *   - Si no se proveen valores de ventas o pedidos, se asignan valores por defecto o cero.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, GraficaComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  public servicioPedidos = inject(PedidoService);

  @Input() ventasHoyPesos: number = 0;
  @Input() cantidadPedidos: number = 0;

  /**
   * Intención: Aprobar un corte de caja diario realizado por un empleado.
   * Parámetros:
   *   - corteId (string): ID de referencia del corte de caja.
   * Retorno: void.
   */
  aprobarCorte(corteId: string): void {
    const cortes = this.servicioPedidos.cortesCaja();
    const actualizados = cortes.map(c => {
      if (c.id === corteId) {
        return { ...c, estado: 'Aprobado' as const };
      }
      return c;
    });
    this.servicioPedidos.cortesCaja.set(actualizados);
  }
}
