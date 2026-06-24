import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoCocina } from '../tablero-kanban/tablero-kanban.component';
import { PedidoService, CorteCaja } from '../../../../core/services/pedido.service';
import { GeneradorDocumentosService } from '../../../../core/services/generador-documentos.service';

/**
 * Componente: VistaCorteComponent
 * Intención: Proveer al empleado de caja una herramienta interactiva para procesar, declarar y enviar el corte de caja de las ventas del día al administrador.
 * Parámetros:
 *   - pedidos: PedidoCocina[] - Listado de pedidos atendidos hoy.
 *   - nombreEmpleado: string - Nombre de quien realiza el corte.
 * Retorno: Instancia de VistaCorteComponent.
 * Casos límite:
 *   - Calcula de forma dinámica el monto total acumulado sumando un precio base estimado por pizza para simular las ventas reales si no hay importes detallados.
 *   - Deshabilita el envío si ya existe un corte enviado para la fecha actual o si no hay ventas registradas.
 */
@Component({
  selector: 'app-vista-corte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-corte.component.html'
})
export class VistaCorteComponent {
  private servicioPedidos = inject(PedidoService);
  private generadorDocumentos = inject(GeneradorDocumentosService);

  ultimoCorteGenerado: CorteCaja | null = null;

  @Input() pedidos: PedidoCocina[] = [];
  @Input() nombreEmpleado: string = 'Carlos Mendoza';

  @Output() corteEnviado = new EventEmitter<string>();

  observaciones: string = '';
  corteDeHoyEnviado: boolean = false;

  /**
   * Obtener fecha formateada del día actual.
   */
  readonly fechaHoy: string = new Date().toLocaleDateString('es-MX');

  /**
   * Precios simulados por platillo para calcular ventas reales.
   */
  private readonly preciosSimulados: { [platillo: string]: number } = {
    'Pepperoni Familiar': 185,
    'Mexicana Grande': 195,
    'Hawaiana Familiar': 175,
    'Cuatro Quesos': 195
  };

  /**
   * Intención: Calcular la cantidad de pedidos completados/entregados.
   * Retorno: number - Conteo de pedidos.
   */
  calcularCantidadPedidos(): number {
    return this.pedidos.filter(p => p.estado === 'Entregado').length;
  }

  /**
   * Intención: Calcular el monto acumulado total de ventas.
   * Retorno: number - Total de ventas del día en pesos.
   */
  calcularTotalVentas(): number {
    return this.pedidos
      .filter(p => p.estado === 'Entregado')
      .reduce((acumulado, pedido) => {
        const precio = this.preciosSimulados[pedido.platillo] || 180;
        return acumulado + precio;
      }, 0);
  }

  /**
   * Intención: Consolidar y enviar el corte de caja al administrador del negocio.
   * Retorno: void.
   */
  enviarCorte(): void {
    const total = this.calcularTotalVentas();
    const cantidad = this.calcularCantidadPedidos();

    if (total === 0 && cantidad === 0) {
      this.corteEnviado.emit('No es posible realizar un corte de caja sin ventas o pedidos entregados.');
      return;
    }

    const nuevoCorte: CorteCaja = {
      id: '#C-' + Math.floor(1000 + Math.random() * 9000),
      fecha: this.fechaHoy,
      empleado: this.nombreEmpleado,
      totalVentas: total,
      cantidadPedidos: cantidad,
      observaciones: this.observaciones || 'Corte de caja diario consolidado sin incidencias.',
      estado: 'Pendiente'
    };

    // Agregar al signal global del servicio para que lo lea el Administrador
    const cortesActuales = this.servicioPedidos.cortesCaja();
    this.servicioPedidos.cortesCaja.set([nuevoCorte, ...cortesActuales]);

    this.ultimoCorteGenerado = nuevoCorte;
    this.corteDeHoyEnviado = true;
    this.observaciones = '';
    this.corteEnviado.emit(`Corte de caja ${nuevoCorte.id} enviado exitosamente al administrador.`);
  }

  /**
   * Intención: Generar y descargar el comprobante de corte de caja en PDF.
   * Retorno: void.
   */
  descargarCortePDF(): void {
    if (this.ultimoCorteGenerado) {
      this.generadorDocumentos.descargarCortePDF(this.ultimoCorteGenerado);
    }
  }

  /**
   * Intención: Generar y descargar el comprobante de corte de caja en XML.
   * Retorno: void.
   */
  descargarCorteXML(): void {
    if (this.ultimoCorteGenerado) {
      this.generadorDocumentos.descargarCorteXML(this.ultimoCorteGenerado);
    }
  }
}
