import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraficaComponent, DatoGrafica } from '../../../../shared/components/grafica/grafica.component';
import { ProductoAdmin, SucursalAdmin } from '../../administrador.component';
import { PedidoService } from '../../../../core/services/pedido.service';

/**
 * Componente: ReportesComponent
 * Intención: Presentar gráficas interactivas con parámetros calculables en tiempo real.
 * Parámetros:
 *   - listaProductos: ProductoAdmin[] - Lista de productos para calcular.
 *   - listaSucursales: SucursalAdmin[] - Lista de sucursales para calcular.
 */
@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, GraficaComponent],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  @Input() listaProductos: ProductoAdmin[] = [];
  @Input() listaSucursales: SucursalAdmin[] = [];

  @Output() exportar = new EventEmitter<{ formato: 'PDF' | 'EXCEL', tipo: string }>();

  tipoReporte: 'ventas_semanales' | 'productos_mas_vendidos' | 'ventas_por_sucursal' = 'ventas_semanales';
  datosGraficaCalculados: DatoGrafica[] = [];
  tituloGraficaCalculado: string = '';
  filtroPrecioMinimo: number = 0;

  ngOnInit(): void {
    this.recalcularDatosReporte();
  }

  recalcularDatosReporte(): void {
    if (this.tipoReporte === 'ventas_semanales') {
      this.tituloGraficaCalculado = 'Ventas Semanales';
      this.pedidoService.obtenerEstadisticasVentas().subscribe({
        next: (datos) => this.datosGraficaCalculados = datos,
        error: () => {
          this.datosGraficaCalculados = [
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
    } else if (this.tipoReporte === 'productos_mas_vendidos') {
      this.tituloGraficaCalculado = 'Pizzas más Vendidas';
      this.pedidoService.obtenerEstadisticasProductos().subscribe({
        next: (datos) => {
          // Filtrar por el precio mínimo si es requerido
          const nombresValidos = this.listaProductos
            .filter(p => p.precio >= this.filtroPrecioMinimo)
            .map(p => p.nombre);

          this.datosGraficaCalculados = datos.filter(d => nombresValidos.includes(d.etiqueta));
        },
        error: () => this.datosGraficaCalculados = []
      });
    } else if (this.tipoReporte === 'ventas_por_sucursal') {
      this.tituloGraficaCalculado = 'Ventas por Sucursal';
      this.datosGraficaCalculados = this.listaSucursales.map(s => ({
        etiqueta: s.nombre,
        valor: s.ventasTotales
      }));
    }
  }

  exportarReporte(formato: 'PDF' | 'EXCEL'): void {
    this.exportar.emit({ formato, tipo: this.tipoReporte });
  }
}
