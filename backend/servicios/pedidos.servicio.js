const PedidoModelo = require('../modelos/pedido.modelo');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Servicio: PedidosServicio
 * Intención: Alojar la lógica de negocio para crear órdenes y estructurar el historial consolidado.
 */
class PedidosServicio {
  /**
   * Intención: Registrar un nuevo pedido en la base de datos.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   *   - idSucursal (number): ID de la sucursal (ej. 1).
   *   - total (number): Monto total.
   *   - productos (Array): Productos comprados.
   * Retorno: Promise<number> - ID del pedido creado.
   */
  static async crearPedido(idCliente, idSucursal, total, productos) {
    return await PedidoModelo.crear(idCliente, idSucursal, total, productos);
  }

  /**
   * Intención: Consultar el historial de un cliente y consolidar los detalles del pedido en arreglos anidados.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   * Retorno: Promise<Array<Object>> - Historial estructurado.
   */
  static async obtenerHistorialCliente(idCliente) {
    const filas = await PedidoModelo.obtenerHistorial(idCliente);
    const mapaPedidos = new Map();

    for (const fila of filas) {
      if (!mapaPedidos.has(fila.id)) {
        mapaPedidos.set(fila.id, {
          id: `#${fila.id}`,
          fechaHora: new Date(fila.fechaHora).toLocaleString('es-MX', { hour12: false }).substring(0, 17),
          total: parseFloat(fila.total),
          estado: fila.estado,
          metodoEntrega: 'a domicilio',
          telefono: '5500000000',
          metodoPago: 'Efectivo',
          cantidadTotal: 0,
          productos: []
        });
      }

      const pedido = mapaPedidos.get(fila.id);
      pedido.cantidadTotal += fila.cantidad;
      pedido.productos.push({
        cantidad: fila.cantidad,
        producto: {
          id: fila.idProducto,
          nombre: fila.nombre,
          descripcion: fila.descripcion,
          precio: parseFloat(fila.precioUnitario),
          categoria: fila.categoria
        }
      });
    }

    return Array.from(mapaPedidos.values());
  }

  /**
   * Obtiene las estadísticas de ventas semanales del negocio.
   * Intención: Consolidar datos de ventas agrupados por día de la semana.
   */
  static async obtenerVentasSemanales() {
    return await PedidoModelo.obtenerVentasSemanales();
  }

  /**
   * Obtiene la cantidad de productos gourmet vendidos en el catálogo.
   * Intención: Consolidar cantidades vendidas agregadas por producto.
   */
  static async obtenerProductosMasVendidos() {
    return await PedidoModelo.obtenerProductosMasVendidos();
  }

  /**
   * Obtiene el acumulado financiero del día de hoy.
   */
  static async obtenerKpis() {
    return await PedidoModelo.obtenerResumenKpis();
  }

  /**
   * Obtiene todos los pedidos de la base de datos consolidados por ID.
   */
  static async obtenerTodosConsolidados() {
    const filas = await PedidoModelo.obtenerTodos();
    const mapaPedidos = new Map();

    for (const fila of filas) {
      if (!mapaPedidos.has(fila.id)) {
        mapaPedidos.set(fila.id, {
          id: `#${fila.id}`,
          fechaHora: new Date(fila.fechaHora).toLocaleString('es-MX', { hour12: false }).substring(0, 17),
          total: parseFloat(fila.total),
          estado: fila.estado,
          metodoEntrega: 'a domicilio',
          telefono: '5500000000',
          metodoPago: 'Efectivo',
          cantidadTotal: 0,
          productos: []
        });
      }

      const pedido = mapaPedidos.get(fila.id);
      pedido.cantidadTotal += fila.cantidad;
      pedido.productos.push({
        cantidad: fila.cantidad,
        producto: {
          id: fila.idProducto,
          nombre: fila.nombre,
          descripcion: fila.descripcion,
          precio: parseFloat(fila.precioUnitario),
          categoria: fila.categoria
        }
      });
    }

    return Array.from(mapaPedidos.values());
  }

  /**
   * Actualiza el estado de un pedido en la base de datos MySQL y escribe un log de auditoría.
   */
  static async actualizarEstado(idPedido, estado) {
    if (!idPedido || !estado) {
      throw new Error('ID de pedido o estado inválido.');
    }

    const exito = await PedidoModelo.actualizarEstado(idPedido, estado);

    if (exito) {
      registrador.info(`AUDITORÍA: El estado del pedido ID: ${idPedido} se actualizó a: ${estado}.`);
    }

    return exito;
  }
}

module.exports = PedidosServicio;
