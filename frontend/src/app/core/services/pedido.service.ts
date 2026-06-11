import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../models/carrito.model';
import { PEDIDOS_MOCK, CORTES_CAJA_MOCK, FACTURAS_MOCK } from '../models/datos-simulados';

/**
 * Interfaz que representa la estructura de un pedido activo en el sistema.
 */
export interface PedidoActivo {
  /** Identificador único del pedido (ej. #4928). */
  id: string;
  /** Estado actual de la preparación (Preparando, En el horno, En camino, Entregado). */
  estado: string;
  /** Porcentaje numérico del progreso (0 a 100). */
  progreso: number;
  /** Tiempo estimado de entrega restante en minutos. */
  minutos: number;
  /** Lista de productos incluidos en el pedido actual. */
  productos: ItemCarrito[];
  /** Detalles adicionales del envío (opcional). */
  detallesEntrega?: {
    metodo: string;
    direccion?: string;
    telefono: string;
    metodoPago: string;
  };
}

/**
 * Interfaz que representa un pedido histórico realizado por el cliente.
 * Conforme a la solicitud del usuario para desglosar la información detallada.
 */
export interface PedidoHistorico {
  /** Identificador único del pedido (ej. #3821). */
  id: string;
  /** Fecha y hora en formato legible (ej. 09/06/2026, 19:42). */
  fechaHora: string;
  /** Costo total final de la compra. */
  total: number;
  /** Estado de la compra: 'pagado', 'cancelado', 'En preparación', 'En camino', 'Entregado'. */
  estado: string;
  /** Método de entrega: 'recogió en sucursal' o 'a domicilio'. */
  metodoEntrega: 'recogió en sucursal' | 'a domicilio';
  /** Dirección de envío si aplica. */
  direccion?: string;
  /** Teléfono de contacto registrado. */
  telefono: string;
  /** Método de pago detallado. */
  metodoPago: string;
  /** Cantidad total de productos comprados. */
  cantidadTotal: number;
  /** Lista completa de productos adquiridos. */
  productos: ItemCarrito[];
  /** Porcentaje del progreso (si está activo). */
  progreso?: number;
  /** Minutos restantes (si está activo). */
  minutos?: number;
}

/**
 * Interfaz para modelar una Factura (CFDI) dentro del flujo.
 */
export interface FacturaDetalle {
  id: string;
  fechaHora: string;
  pedidoId: string;
  rfc: string;
  razonSocial: string;
  codigoPostal: string;
  usoCfdi: string;
  regimenFiscal: string;
  correo: string;
  total: number;
  estado: 'Emitida' | 'Cancelada';
  uuid: string;
}

/**
 * Interfaz que representa el corte de caja diario realizado por un empleado.
 */
export interface CorteCaja {
  /** Identificador único del corte (ej. #C-4921). */
  id: string;
  /** Fecha del corte (ej. 11/06/2026). */
  fecha: string;
  /** Nombre del empleado que realizó el corte. */
  empleado: string;
  /** Monto total acumulado en ventas del día. */
  totalVentas: number;
  /** Número de pedidos que se cobraron e incluyeron en el corte. */
  cantidadPedidos: number;
  /** Comentarios u observaciones del personal de caja. */
  observaciones?: string;
  /** Estado del corte: 'Pendiente' o 'Aprobado' por el administrador. */
  estado: 'Pendiente' | 'Aprobado';
}

/**
 * Servicio: PedidoService
 * Intención: Gestionar y centralizar de forma reactiva el estado de los pedidos del cliente en el frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  /** Signal reactivo que almacena la información del pedido activo en curso, o null si no hay ninguno. */
  pedidoActivo = signal<PedidoActivo | null>(null);

  /** Signal reactivo que almacena la lista completa de pedidos realizados (historial). */
  historialPedidos = signal<PedidoHistorico[]>([]);

  /** Signal reactivo que almacena el histórico de cortes de caja de los empleados. */
  cortesCaja = signal<CorteCaja[]>([]);

  /** Signal reactivo que almacena la lista de facturas generadas. */
  listaFacturas = signal<FacturaDetalle[]>([]);

  /** Signal reactivo que almacena el pedido seleccionado para facturar por el administrador o el cliente. */
  pedidoParaFacturar = signal<PedidoHistorico | null>(null);

  /** Referencia del intervalo de simulación activa para limpiar la suscripción cuando termine. */
  private intervaloSimulacion: any = null;

  /**
   * Constructor del servicio.
   * Intención: Inicializar el historial con algunos pedidos mockeados para pruebas realistas.
   */
  constructor() {
    this.historialPedidos.set(PEDIDOS_MOCK);
    this.cortesCaja.set(CORTES_CAJA_MOCK);
    this.listaFacturas.set(FACTURAS_MOCK);
  }

  /**
   * Intención: Calcular de forma reactiva el monto total acumulado del pedido activo.
   * Retorno: number - Total monetario en pesos mexicanos.
   */
  totalPedidoActivo = computed(() => {
    const pedido = this.pedidoActivo();
    if (!pedido) return 0;
    return pedido.productos.reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0);
  });

  /**
   * Intención: Crear un nuevo pedido activo en el sistema a partir de los datos de checkout y arrancar la simulación.
   * Parámetros:
   *   - productos (ItemCarrito[]): Artículos del pedido.
   *   - metodoEntrega (string): "domicilio" o "sucursal".
   *   - direccion (string): Dirección física si aplica.
   *   - telefono (string): Teléfono del cliente.
   *   - metodoPago (string): Método de pago.
   * Retorno: void.
   */
  crearPedido(
    productos: ItemCarrito[],
    metodoEntrega: string,
    direccion: string,
    telefono: string,
    metodoPago: string
  ): void {
    const idFicticio = '#' + Math.floor(1000 + Math.random() * 9000);
    const totalCalc = productos.reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0) + (metodoEntrega === 'domicilio' ? 45 : 0);
    const cantidadTotalCalc = productos.reduce((acumulado, item) => acumulado + item.cantidad, 0);
    
    const nuevoPedido: PedidoActivo = {
      id: idFicticio,
      estado: 'En preparación',
      progreso: 10,
      minutos: 15,
      productos: [...productos],
      detallesEntrega: {
        metodo: metodoEntrega === 'domicilio' ? 'Entrega a Domicilio' : 'Recoger en Sucursal',
        direccion: metodoEntrega === 'domicilio' ? direccion : 'Sucursal Principal (Centro)',
        telefono,
        metodoPago: metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Efectivo al Recibir'
      }
    };

    this.pedidoActivo.set(nuevoPedido);

    // Agregar al historial de compras
    const fechaActualStr = new Date().toLocaleString('es-MX', { hour12: false }).substring(0, 17);
    const nuevoHistorico: PedidoHistorico = {
      id: idFicticio,
      fechaHora: fechaActualStr,
      total: totalCalc,
      estado: 'En preparación',
      metodoEntrega: metodoEntrega === 'domicilio' ? 'a domicilio' : 'recogió en sucursal',
      direccion: metodoEntrega === 'domicilio' ? direccion : 'Sucursal Principal (Centro)',
      telefono,
      metodoPago: metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Efectivo al Recibir',
      productos: [...productos],
      cantidadTotal: cantidadTotalCalc,
      progreso: 10,
      minutos: 15
    };

    this.historialPedidos.set([nuevoHistorico, ...this.historialPedidos()]);
    this.iniciarSimulacion();
  }

  /**
   * Intención: Incrementar la cantidad de un artículo directamente en el pedido activo.
   * Parámetros:
   *   - productoId (number): ID único del producto.
   * Retorno: void.
   */
  incrementarCantidad(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const productosActualizados = pedido.productos.map(item => {
        if (item.producto.id === productoId) {
          return { ...item, cantidad: item.cantidad + 1 };
        }
        return item;
      });
      this.pedidoActivo.set({ ...pedido, productos: productosActualizados });

      // Actualizar también en el historial
      this.actualizarHistorialProductos(pedido.id, productosActualizados);
    }
  }

  /**
   * Intención: Decrementar la cantidad de un artículo directamente en el pedido activo. Si llega a 0, se remueve.
   * Parámetros:
   *   - productoId (number): ID único del producto.
   * Retorno: void.
   */
  decrementarCantidad(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const item = pedido.productos.find(i => i.producto.id === productoId);
      if (item) {
        if (item.cantidad > 1) {
          const productosActualizados = pedido.productos.map(i => {
            if (i.producto.id === productoId) {
              return { ...i, cantidad: i.cantidad - 1 };
            }
            return i;
          });
          this.pedidoActivo.set({ ...pedido, productos: productosActualizados });
          
          // Actualizar también en el historial
          this.actualizarHistorialProductos(pedido.id, productosActualizados);
        } else {
          this.eliminarProducto(productoId);
        }
      }
    }
  }

  /**
   * Intención: Eliminar por completo un artículo del pedido activo. Si el pedido queda sin productos, se limpia.
   * Parámetros:
   *   - productoId (number): ID único del producto.
   * Retorno: void.
   */
  eliminarProducto(productoId: number): void {
    const pedido = this.pedidoActivo();
    if (pedido) {
      const productosActualizados = pedido.productos.filter(item => item.producto.id !== productoId);
      if (productosActualizados.length > 0) {
        this.pedidoActivo.set({ ...pedido, productos: productosActualizados });
        
        // Actualizar también en el historial
        this.actualizarHistorialProductos(pedido.id, productosActualizados);
      } else {
        this.limpiarPedidoActivo();
      }
    }
  }

  /**
   * Intención: Auxiliar para mantener sincronizados los productos en el historial tras editar el pedido activo.
   */
  private actualizarHistorialProductos(pedidoId: string, productosActualizados: ItemCarrito[]): void {
    const totalCalc = productosActualizados.reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0);
    const cantidadTotalCalc = productosActualizados.reduce((acumulado, item) => acumulado + item.cantidad, 0);

    const historialActualizado = this.historialPedidos().map(p => {
      if (p.id === pedidoId) {
        return {
          ...p,
          productos: productosActualizados,
          total: totalCalc + (p.metodoEntrega === 'a domicilio' ? 45 : 0),
          cantidadTotal: cantidadTotalCalc
        };
      }
      return p;
    });
    this.historialPedidos.set(historialActualizado);
  }

  /**
   * Intención: Limpiar el estado del pedido activo y detener cualquier simulación activa.
   * Retorno: void.
   */
  limpiarPedidoActivo(): void {
    if (this.intervaloSimulacion) {
      clearInterval(this.intervaloSimulacion);
      this.intervaloSimulacion = null;
    }
    this.pedidoActivo.set(null);
  }

  /**
   * Intención: Iniciar el proceso de simulación en tiempo real del progreso de preparación y envío del pedido activo.
   * Retorno: void.
   */
  iniciarSimulacion(): void {
    if (this.intervaloSimulacion) {
      clearInterval(this.intervaloSimulacion);
    }

    this.intervaloSimulacion = setInterval(() => {
      const pedido = this.pedidoActivo();
      if (!pedido) {
        clearInterval(this.intervaloSimulacion);
        this.intervaloSimulacion = null;
        return;
      }

      let nuevoProgreso = pedido.progreso + 15;
      let nuevoEstado = pedido.estado;
      let nuevosMinutos = Math.max(0, pedido.minutos - 3);

      if (nuevoProgreso >= 100) {
        nuevoProgreso = 100;
        nuevoEstado = 'Entregado';
        nuevosMinutos = 0;
        clearInterval(this.intervaloSimulacion);
        this.intervaloSimulacion = null;
      } else if (nuevoProgreso >= 70) {
        nuevoEstado = 'En camino';
      } else if (nuevoProgreso >= 40) {
        nuevoEstado = 'En el horno';
      }

      const actualizado = {
        ...pedido,
        progreso: nuevoProgreso,
        estado: nuevoEstado,
        minutos: nuevosMinutos
      };

      this.pedidoActivo.set(actualizado);

      // Actualizar también en el historial
      const historialActualizado = this.historialPedidos().map(p => {
        if (p.id === pedido.id) {
          return {
            ...p,
            estado: nuevoEstado === 'Entregado' ? 'pagado' : nuevoEstado,
            progreso: nuevoProgreso,
            minutos: nuevosMinutos
          };
        }
        return p;
      });
      this.historialPedidos.set(historialActualizado);
    }, 12000); // Se actualiza el estado cada 12 segundos
  }
}
