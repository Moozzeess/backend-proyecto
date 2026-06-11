import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraficaComponent, DatoGrafica } from '../../../../shared/components/grafica/grafica.component';
import { ProductoAdmin, SucursalAdmin } from '../../administrador.component';

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
      this.datosGraficaCalculados = [
        { etiqueta: 'Lun', valor: 28400 },
        { etiqueta: 'Mar', valor: 31200 },
        { etiqueta: 'Mie', valor: 29500 },
        { etiqueta: 'Jue', valor: 38700 },
        { etiqueta: 'Vie', valor: 48920 },
        { etiqueta: 'Sab', valor: 55400 },
        { etiqueta: 'Dom', valor: 58100 }
      ];
    } else if (this.tipoReporte === 'productos_mas_vendidos') {
      this.tituloGraficaCalculado = 'Pizzas más Vendidas';
      const filtrados = this.listaProductos.filter(p => p.precio >= this.filtroPrecioMinimo);
      this.datosGraficaCalculados = filtrados.map(p => ({
        etiqueta: p.nombre,
        valor: Math.max(10, Math.floor(500 - (p.precio * 1.5)))
      }));
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
