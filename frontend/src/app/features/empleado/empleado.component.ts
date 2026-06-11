import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importación de subcomponentes locales
import { TableroKanbanComponent, PedidoCocina } from './components/tablero-kanban/tablero-kanban.component';
import { VistaCocinaComponent } from './components/vista-cocina/vista-cocina.component';
import { VistaEntregasComponent } from './components/vista-entregas/vista-entregas.component';
import { VistaInventarioComponent, IngredienteCocina } from './components/vista-inventario/vista-inventario.component';
import { VistaNotificacionesComponent, AlertaNotificacion } from './components/vista-notificaciones/vista-notificaciones.component';
import { VistaCorteComponent } from './components/vista-corte/vista-corte.component';
import { FacturacionComponent } from '../../shared/components/facturacion/facturacion.component';

/**
 * Componente: EmpleadoComponent
 * Intención: Representar el panel de control maestro para el personal del establecimiento (cocineros, repartidores, almacenistas).
 *            Orquesta la comunicación y flujo de datos de los subcomponentes del panel de empleado.
 * Parámetros: Ninguno.
 * Retorno: Instancia de EmpleadoComponent.
 * Casos límite:
 *   - Al reabastecer un insumo, actualiza el nivel de stock y limpia la alerta correspondiente si el nivel supera el stock mínimo.
 *   - Calcula el total de pedidos pendientes (estado 'Nuevo') para renderizar el badge de notificaciones globales en el header.
 */
@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [
    CommonModule,
    TableroKanbanComponent,
    VistaCocinaComponent,
    VistaEntregasComponent,
    VistaInventarioComponent,
    VistaNotificacionesComponent,
    VistaCorteComponent,
    FacturacionComponent
  ],
  templateUrl: './empleado.component.html'
})
export class EmpleadoComponent implements OnInit {
  /**
   * Nombre del empleado logueado en la sesión.
   */
  nombreEmpleado: string = 'Carlos Mendoza';

  /**
   * Sección seleccionada actualmente para visualización en el panel.
   */
  seccionActiva: 'pedidos' | 'cocina' | 'entregas' | 'inventario' | 'notificaciones' | 'corte' | 'facturacion' = 'pedidos';

  /**
   * Listado reactivo de pedidos para simulación en cocina y reparto.
   */
  listaPedidos: PedidoCocina[] = [];

  /**
   * Listado reactivo de ingredientes del inventario de insumos.
   */
  listaInventario: IngredienteCocina[] = [];

  /**
   * Listado de notificaciones activas para el panel operativo.
   */
  listaNotificaciones: AlertaNotificacion[] = [];

  /**
   * Intención: Inicializar datos base simulados para pedidos, inventario y notificaciones al cargar el componente.
   * Retorno: void.
   */
  ngOnInit(): void {
    this.listaPedidos = [
      { id: '#4521', platillo: 'Pepperoni Familiar', estado: 'Nuevo', progreso: 0 },
      { id: '#4518', platillo: 'Mexicana Grande', estado: 'Preparando', progreso: 70 },
      { id: '#4510', platillo: 'Hawaiana Familiar', estado: 'Listo', progreso: 100 },
      { id: '#4505', platillo: 'Cuatro Quesos', estado: 'Entregado', progreso: 100 }
    ];

    this.listaInventario = [
      { id: 1, nombre: 'Queso Mozzarella', stockActual: 12, stockMinimo: 15, unidad: 'kg' },
      { id: 2, nombre: 'Pepperoni', stockActual: 18, stockMinimo: 8, unidad: 'kg' },
      { id: 3, nombre: 'Jamón York', stockActual: 9, stockMinimo: 10, unidad: 'kg' },
      { id: 4, nombre: 'Piña Caramelizada', stockActual: 25, stockMinimo: 5, unidad: 'kg' },
      { id: 5, nombre: 'Champiñones', stockActual: 14, stockMinimo: 6, unidad: 'kg' }
    ];

    this.listaNotificaciones = [
      { id: 'N1', tipo: 'alerta', mensaje: 'Queso Mozzarella con stock críticamente bajo (12 kg).', fechaHora: '10:30' },
      { id: 'N2', tipo: 'alerta', mensaje: 'Jamón York con stock críticamente bajo (9 kg).', fechaHora: '10:31' }
    ];
  }

  /**
   * Intención: Calcular la cantidad de pedidos nuevos.
   * Retorno: number - Número de pedidos nuevos.
   */
  obtenerCantidadPedidosNuevos(): number {
    return this.listaPedidos.filter(p => p.estado === 'Nuevo').length;
  }

  /**
   * Intención: Cambiar la pestaña o módulo activo en el sidebar.
   * Parámetros:
   *   - seccion: 'pedidos' | 'cocina' | 'entregas' | 'inventario' | 'notificaciones' | 'corte' - Nueva pestaña activa.
   * Retorno: void.
   */
  cambiarSeccion(seccion: typeof this.seccionActiva): void {
    this.seccionActiva = seccion;
  }

  /**
   * Intención: Controlar los cambios de estado en las órdenes de cocina y reparto.
   * Parámetros:
   *   - evento ({ id: string, nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }): Datos de la orden modificada.
   * Retorno: void.
   */
  alCambiarEstadoPedido(evento: { id: string; nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }): void {
    const pedido = this.listaPedidos.find(p => p.id === evento.id);
    if (pedido) {
      pedido.estado = evento.nuevoEstado;
      if (evento.nuevoEstado === 'Preparando') {
        pedido.progreso = 30;
      } else if (evento.nuevoEstado === 'Listo') {
        pedido.progreso = 100;
      }
      this.agregarNotificacion('informacion', `Pedido ${pedido.id} actualizado a estado: ${evento.nuevoEstado}`);
    }
  }

  /**
   * Intención: Incrementar el stock del ingrediente seleccionado y limpiar alertas relacionadas si supera el mínimo.
   * Parámetros:
   *   - ingredienteId (number): ID del insumo a reabastecer.
   * Retorno: void.
   */
  alReabastecerStock(ingredienteId: number): void {
    const ingrediente = this.listaInventario.find(i => i.id === ingredienteId);
    if (ingrediente) {
      ingrediente.stockActual += 10;
      this.agregarNotificacion('exito', `Se reabasteció ${ingrediente.nombre}. Nuevo stock: ${ingrediente.stockActual} ${ingrediente.unidad}`);
      
      // Si ya supera el stock mínimo, eliminamos la alerta de la lista de notificaciones
      if (ingrediente.stockActual > ingrediente.stockMinimo) {
        this.listaNotificaciones = this.listaNotificaciones.filter(
          nota => !nota.mensaje.includes(ingrediente.nombre)
        );
      }
    }
  }

  /**
   * Intención: Capturar el evento de envío del corte de caja y registrar una alerta exitosa.
   * Parámetros:
   *   - mensaje (string): Descripción de la transacción de corte de caja.
   * Retorno: void.
   */
  alEnviarCorte(mensaje: string): void {
    this.agregarNotificacion('exito', mensaje);
  }

  /**
   * Intención: Descartar una notificación del panel mediante su ID único.
   * Parámetros:
   *   - id (string): Identificador único de la alerta.
   * Retorno: void.
   */
  alDescartarNotificacion(id: string): void {
    this.listaNotificaciones = this.listaNotificaciones.filter(n => n.id !== id);
  }

  /**
   * Intención: Limpiar por completo la bandeja de notificaciones.
   * Retorno: void.
   */
  alLimpiarNotificaciones(): void {
    this.listaNotificaciones = [];
  }

  /**
   * Intención: Registrar una nueva notificación en el centro de alertas.
   * Parámetros:
   *   - tipo ('alerta' | 'exito' | 'informacion'): Tipo visual de alerta.
   *   - mensaje (string): Mensaje detallado.
   * Retorno: void.
   */
  private agregarNotificacion(tipo: 'alerta' | 'exito' | 'informacion', mensaje: string): void {
    const id = 'N_' + Math.random().toString(36).substring(2, 9);
    const ahora = new Date();
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const fechaHora = `${horas}:${minutos}`;

    this.listaNotificaciones = [
      { id, tipo, mensaje, fechaHora },
      ...this.listaNotificaciones
    ];
  }
}
