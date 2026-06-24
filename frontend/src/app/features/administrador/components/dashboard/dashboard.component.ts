import { Component, Input, inject, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  public servicioPedidos = inject(PedidoService);

  @Input() ventasHoyPesos: number = 0;
  @Input() cantidadPedidos: number = 0;
  @Input() clientesActivos: number = 0;
  @Input() ticketPromedio: number = 0;

  datosGraficaSemanales: any[] = [];
  productosMasVendidos: any[] = [];

  ngOnInit(): void {
    this.cargarCortesCaja();
    this.cargarDatosDashboardReal();
  }

  cargarCortesCaja(): void {
    this.servicioPedidos.obtenerCortesCaja().subscribe();
  }

  cargarDatosDashboardReal(): void {
    // Obtener ventas semanales de la base de datos
    this.servicioPedidos.obtenerEstadisticasVentas().subscribe({
      next: (datos) => this.datosGraficaSemanales = datos,
      error: () => {
        this.datosGraficaSemanales = [
          { etiqueta: 'Lun', valor: 0 },
          { etiqueta: 'Mar', valor: 0 },
          { etiqueta: 'Mie', valor: 0 },
          { etiqueta: 'Jue', valor: 0 },
          { etiqueta: 'Vie', valor: 0 },
          { etiqueta: 'Sab', valor: 0 },
          { etiqueta: 'Dom', valor: 0 }
        ];
      }
    });

    // Obtener productos más vendidos de la base de datos
    this.servicioPedidos.obtenerEstadisticasProductos().subscribe({
      next: (datos) => this.productosMasVendidos = datos.slice(0, 3), // Top 3
      error: () => this.productosMasVendidos = []
    });
  }

  /**
   * Intención: Aprobar un corte de caja diario realizado por un empleado.
   * Parámetros:
   *   - corteId (string): ID de referencia del corte de caja.
   * Retorno: void.
   */
  aprobarCorte(corteId: string): void {
    this.servicioPedidos.aprobarCorteCaja(corteId, 'Aprobado').subscribe({
      next: (exito) => {
        if (exito) {
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
    });
  }
}
