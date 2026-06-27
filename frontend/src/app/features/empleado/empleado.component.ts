import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { PedidoService } from '../../core/services/pedido.service';
import { InventarioService } from '../../core/services/inventario.service';

// Importación de subcomponentes locales
import { TableroKanbanComponent, PedidoCocina } from './components/tablero-kanban/tablero-kanban.component';
import { VistaCocinaComponent } from './components/vista-cocina/vista-cocina.component';
import { VistaEntregasComponent } from './components/vista-entregas/vista-entregas.component';
import { VistaInventarioComponent, IngredienteCocina } from './components/vista-inventario/vista-inventario.component';
import { VistaNotificacionesComponent, AlertaNotificacion } from './components/vista-notificaciones/vista-notificaciones.component';
import { VistaCorteComponent } from './components/vista-corte/vista-corte.component';
import { FacturacionComponent } from '../../shared/components/facturacion/facturacion.component';
import { VistaVentasSucursalComponent } from './components/vista-ventas-sucursal/vista-ventas-sucursal.component';

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
    FacturacionComponent,
    VistaVentasSucursalComponent
  ],
  templateUrl: './empleado.component.html'
})
export class EmpleadoComponent implements OnInit, OnDestroy {
  private autenticacionService = inject(AutenticacionService);
  private pedidoService = inject(PedidoService);
  private inventarioService = inject(InventarioService);

  /**
   * Nombre del empleado logueado en la sesión.
   */
  nombreEmpleado: string = 'Empleado';

  /**
   * Puesto laboral del empleado.
   */
  puestoEmpleado: string = 'Cajero General';

  /**
   * Sección seleccionada actualmente para visualización en el panel.
   */
  seccionActiva: 'pedidos' | 'ventassucursal' | 'cocina' | 'entregas' | 'inventario' | 'notificaciones' | 'corte' | 'facturacion' = 'pedidos';

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
   * Intención: Constructor por defecto del componente.
   * Parámetros:
   *   - router (Router): Servicio de enrutamiento de Angular.
   */
  constructor(
    private router: Router
  ) { }

  /**
   * Intención: Inicializar datos base reales para pedidos, inventario y notificaciones al cargar el componente.
   * Retorno: void.
   */
  /**
   * Identificador del proceso de intervalo para refrescar la información periódicamente.
   */
  private intervaloSondeo: any;

  ngOnInit(): void {
    // Obtener datos reales del empleado logueado
    const usuarioLogueado = this.autenticacionService.usuarioActual();
    if (usuarioLogueado) {
      this.nombreEmpleado = usuarioLogueado.nombre;
      this.puestoEmpleado = usuarioLogueado.puesto || 'Cajero General';
      
      // Intentar recuperar sección activa previa de sessionStorage
      const seccionGuardada = sessionStorage.getItem('pizza-pizza-empleado-seccion-activa') as typeof this.seccionActiva;
      if (seccionGuardada) {
        this.seccionActiva = seccionGuardada;
      } else {
        // Asignar sección activa inicial basada en el cargo/puesto de manera flexible e inclusiva
        const puestoNormalizado = this.puestoEmpleado.toLowerCase();
        if (puestoNormalizado.includes('chef') || puestoNormalizado.includes('cocina') || puestoNormalizado.includes('cocinero')) {
          this.seccionActiva = 'cocina';
        } else if (puestoNormalizado.includes('repartidor') || puestoNormalizado.includes('entrega') || puestoNormalizado.includes('motociclista')) {
          this.seccionActiva = 'entregas';
        } else {
          this.seccionActiva = 'pedidos';
        }
      }
    }

    this.cargarDatosReales();
    this.iniciarSondeoDatos();
  }

  /**
   * Intención: Limpiar el temporizador de sondeo para prevenir fugas de memoria.
   */
  ngOnDestroy(): void {
    if (this.intervaloSondeo) {
      clearInterval(this.intervaloSondeo);
    }
  }

  /**
   * Intención: Iniciar el sondeo automático de los datos para reflejar los cambios asíncronos.
   */
  private iniciarSondeoDatos(): void {
    try {
      this.intervaloSondeo = setInterval(() => {
        this.cargarDatosReales();
      }, 5000);
    } catch (e) {
      // Caso límite: error al establecer intervalo
    }
  }

  /**
   * Intención: Cargar pedidos e inventario reales desde el backend y refrescar la UI.
   * Retorno: void.
   */
  cargarDatosReales(): void {
    // Cargar Pedidos del Backend
    this.pedidoService.obtenerTodos().subscribe({
      next: (pedidos) => {
        // Mapear los pedidos de la base de datos al formato del Tablero Kanban y Cocina
        this.listaPedidos = pedidos.map(p => {
          let estadoTraducido: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' = 'Nuevo';
          let progreso = 0;

          const estLower = p.estado.toLowerCase();
          if (estLower === 'preparando') {
            estadoTraducido = 'Preparando';
            progreso = 30;
          } else if (estLower === 'listo') {
            estadoTraducido = 'Listo';
            progreso = 100;
          } else if (estLower === 'entregado' || estLower === 'pagado') {
            estadoTraducido = 'Entregado';
            progreso = 100;
          } else {
            estadoTraducido = 'Nuevo';
            progreso = 0;
          }

          // Obtener el primer platillo de la lista para mostrar como etiqueta
          const platillo = p.productos.length > 0 ? `${p.productos[0].cantidad}x ${p.productos[0].producto.nombre}` : 'Pizza Gourmet';

          return {
            id: p.id,
            platillo,
            estado: estadoTraducido,
            progreso
          };
        });
      },
      error: (err) => {
        this.agregarNotificacion('alerta', 'No se pudieron recuperar los pedidos en tiempo real.');
      }
    });

    // Cargar Inventario del Backend
    this.inventarioService.obtenerIngredientes().subscribe({
      next: (ingredientes) => {
        this.listaInventario = ingredientes.map(i => ({
          id: i.id,
          nombre: i.nombre,
          stockActual: i.stockActual,
          stockMinimo: i.stockMinimo,
          unidad: i.unidad
        }));

        // Limpiar alertas de inventario anteriores
        this.listaNotificaciones = this.listaNotificaciones.filter(n => n.tipo !== 'alerta' || !n.mensaje.includes('stock'));

        // Generar alertas si el stock es críticamente bajo
        this.listaInventario.forEach(ing => {
          if (ing.stockActual <= ing.stockMinimo) {
            this.agregarNotificacion('alerta', `${ing.nombre} con stock críticamente bajo (${ing.stockActual} ${ing.unidad}).`);
          }
        });
      },
      error: (err) => {
        this.agregarNotificacion('alerta', 'No se pudo sincronizar el inventario de insumos.');
      }
    });
  }

  /**
   * Intención: Calcular la cantidad de pedidos nuevos.
   * Retorno: number - Número de pedidos nuevos.
   */
  obtenerCantidadPedidosNuevos(): number {
    return this.listaPedidos.filter(p => p.estado === 'Nuevo').length;
  }

  /**
   * Intención: Finalizar la sesión del empleado activo y redirigir al login.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  /**
   * Intención: Cambiar la pestaña o módulo activo en el sidebar.
   * Parámetros:
   *   - seccion: 'pedidos' | 'cocina' | 'entregas' | 'inventario' | 'notificaciones' | 'corte' | 'facturacion' - Nueva pestaña activa.
   * Retorno: void.
   */
  cambiarSeccion(seccion: typeof this.seccionActiva): void {
    this.seccionActiva = seccion;
    try {
      sessionStorage.setItem('pizza-pizza-empleado-seccion-activa', seccion);
    } catch (e) {
      // Caso límite: cuotas o restricciones de sessionStorage superadas
    }
  }

  /**
   * Intención: Controlar los cambios de estado en las órdenes de cocina y reparto en la base de datos real.
   * Parámetros:
   *   - evento ({ id: string, nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }): Datos de la orden modificada.
   * Retorno: void.
   */
  alCambiarEstadoPedido(evento: { id: string; nuevoEstado: 'Nuevo' | 'Preparando' | 'Listo' | 'Entregado' }): void {
    const pedido = this.listaPedidos.find(p => p.id === evento.id);
    if (pedido) {
      // Registrar cambio en el backend real
      this.pedidoService.actualizarEstadoPedido(evento.id, evento.nuevoEstado).subscribe({
        next: (exito) => {
          if (exito) {
            pedido.estado = evento.nuevoEstado;
            if (evento.nuevoEstado === 'Preparando') {
              pedido.progreso = 30;
            } else if (evento.nuevoEstado === 'Listo') {
              pedido.progreso = 100;
            }
            this.agregarNotificacion('informacion', `Pedido ${pedido.id} actualizado a estado: ${evento.nuevoEstado}`);
            this.cargarDatosReales();
          } else {
            this.agregarNotificacion('alerta', `No se pudo actualizar el pedido ${pedido.id} en el servidor.`);
          }
        },
        error: (err) => {
          this.agregarNotificacion('alerta', `Error al comunicar actualización del pedido ${pedido.id}.`);
        }
      });
    }
  }

  /**
   * Intención: Incrementar el stock del ingrediente seleccionado en la base de datos y limpiar alertas relacionadas.
   * Parámetros:
   *   - ingredienteId (number): ID del insumo a reabastecer.
   * Retorno: void.
   */
  alReabastecerStock(ingredienteId: number): void {
    const ingrediente = this.listaInventario.find(i => i.id === ingredienteId);
    if (ingrediente) {
      this.inventarioService.reabastecerIngrediente(ingredienteId, 10).subscribe({
        next: (exito) => {
          if (exito) {
            this.agregarNotificacion('exito', `Se reabasteció ${ingrediente.nombre} (+10 ${ingrediente.unidad}).`);
            this.cargarDatosReales();
          } else {
            this.agregarNotificacion('alerta', `Fallo al reabastecer ${ingrediente.nombre} en base de datos.`);
          }
        },
        error: () => {
          this.agregarNotificacion('alerta', `Error de red al reabastecer ${ingrediente.nombre}.`);
        }
      });
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
