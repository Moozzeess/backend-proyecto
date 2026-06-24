const { pool } = require('../configuracion/conexion');

/**
 * Modelo: PedidoModelo
 * Intención: Realizar operaciones en las tablas Pedido y DetallePedido en MySQL.
 */
class PedidoModelo {
  /**
   * Intención: Insertar un nuevo pedido y sus detalles en una transacción.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   *   - idSucursal (number): ID de la sucursal.
   *   - total (number): Total de la orden.
   *   - productos (Array<{idProducto, cantidad, precioUnitario}>): Detalles de los productos comprados.
   * Retorno: Promise<number> - ID del pedido creado.
   */
  static async crear(idCliente, idSucursal, total, productos) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // 1. Insertar el Pedido
      const queryPedido = 'INSERT INTO Pedido (total, estado, idCliente, idSucursal) VALUES (?, ?, ?, ?)';
      const [resultadoPedido] = await conexion.query(queryPedido, [total, 'pendiente', idCliente, idSucursal]);
      const idPedido = resultadoPedido.insertId;

      // 2. Insertar los detalles
      const queryDetalle = 'INSERT INTO DetallePedido (cantidad, precioUnitario, subtotal, idPedido, idProducto) VALUES (?, ?, ?, ?, ?)';
      for (const p of productos) {
        const subtotal = p.precioUnitario * p.cantidad;
        await conexion.query(queryDetalle, [p.cantidad, p.precioUnitario, subtotal, idPedido, p.idProducto]);
      }

      await conexion.commit();
      return idPedido;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  /**
   * Intención: Obtener el historial completo de pedidos de un cliente.
   * Parámetros:
   *   - idCliente (number): ID del cliente.
   * Retorno: Promise<Array<Object>> - Lista de pedidos históricos con detalles.
   */
  static async obtenerHistorial(idCliente) {
    const query = `
      SELECT p.idPedido AS id, p.fechaPedido AS fechaHora, p.total, p.estado,
             dp.cantidad, dp.precioUnitario, prod.idProducto, prod.nombre, prod.categoria, prod.descripcion
      FROM Pedido p
      JOIN DetallePedido dp ON p.idPedido = dp.idPedido
      JOIN Producto prod ON dp.idProducto = prod.idProducto
      WHERE p.idCliente = ?
      ORDER BY p.fechaPedido DESC
    `;
    const [filas] = await pool.query(query, [idCliente]);
    return filas;
  }

  /**
   * Intención: Buscar un pedido por su ID único para obtener sus detalles.
   * Parámetros:
   *   - idPedido (number): ID único del pedido.
   * Retorno: Promise<Array<Object>> - Detalles de la orden.
   */
  static async buscarPorId(idPedido) {
    const query = `
      SELECT p.idPedido AS id, p.fechaPedido AS fechaHora, p.total, p.estado, p.idCliente,
             dp.cantidad, dp.precioUnitario, prod.idProducto, prod.nombre, prod.categoria, prod.descripcion
      FROM Pedido p
      JOIN DetallePedido dp ON p.idPedido = dp.idPedido
      JOIN Producto prod ON dp.idProducto = prod.idProducto
      WHERE p.idPedido = ?
    `;
    const [filas] = await pool.query(query, [idPedido]);
    return filas;
  }

  /**
   * Obtiene la lista completa de todos los pedidos históricos registrados en el sistema.
   * Intención: Permitir al administrador ver y gestionar todas las órdenes de la pizzería.
   * Retorno: {Promise<Array<Object>>} Lista de todos los pedidos con sus productos.
   */
  static async obtenerTodos() {
    const query = `
      SELECT p.idPedido AS id, p.fechaPedido AS fechaHora, p.total, p.estado,
             dp.cantidad, dp.precioUnitario, prod.idProducto, prod.nombre, prod.categoria, prod.descripcion
      FROM Pedido p
      JOIN DetallePedido dp ON p.idPedido = dp.idPedido
      JOIN Producto prod ON dp.idProducto = prod.idProducto
      ORDER BY p.fechaPedido DESC
    `;
    const [filas] = await pool.query(query);
    return filas;
  }

  /**
   * Obtiene el acumulado de ventas semanales agrupadas por el nombre del día en español.
   * Intención: Alimentar las estadísticas de rendimiento de la gráfica de ventas del administrador.
   * Retorno: {Promise<Array<Object>>} Listado de días con sus ventas totales acumuladas.
   */
  static async obtenerVentasSemanales() {
    const query = `
      SELECT 
        CASE DAYOFWEEK(fechaPedido)
          WHEN 2 THEN 'Lun'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Mie'
          WHEN 5 THEN 'Jue'
          WHEN 6 THEN 'Vie'
          WHEN 7 THEN 'Sab'
          WHEN 1 THEN 'Dom'
        END AS etiqueta,
        COALESCE(SUM(total), 0) AS valor
      FROM Pedido
      WHERE fechaPedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND estado IN ('pagado', 'Entregado')
      GROUP BY DAYOFWEEK(fechaPedido), etiqueta
      ORDER BY DAYOFWEEK(fechaPedido)
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({ etiqueta: f.etiqueta, valor: parseFloat(f.valor) }));
  }

  /**
   * Obtiene las unidades vendidas por cada producto del catálogo.
   * Intención: Alimentar el reporte gráfico de pizzas y consumibles más populares.
   * Retorno: {Promise<Array<Object>>} Listado de productos con sus cantidades totales vendidas.
   */
  static async obtenerProductosMasVendidos() {
    const query = `
      SELECT prod.nombre AS etiqueta, COALESCE(SUM(dp.cantidad), 0) AS valor
      FROM Producto prod
      LEFT JOIN DetallePedido dp ON prod.idProducto = dp.idProducto
      LEFT JOIN Pedido p ON dp.idPedido = p.idPedido AND p.estado IN ('pagado', 'Entregado')
      GROUP BY prod.idProducto, prod.nombre
      ORDER BY valor DESC
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({ etiqueta: f.etiqueta, valor: parseInt(f.valor, 10) }));
  }

  /**
   * Obtiene los KPIs financieros globales del día de hoy (ventas y cantidad de pedidos).
   * Intención: Mostrar la información real actualizada en el Dashboard del administrador.
   * Retorno: {Promise<Object>} Totales del día.
   */
  static async obtenerResumenKpis() {
    const query = `
      SELECT 
        COALESCE(SUM(total), 0) AS ventasHoy,
        COUNT(idPedido) AS pedidosHoy,
        (SELECT COUNT(DISTINCT idCliente) FROM Pedido WHERE estado IN ('pagado', 'Entregado')) AS clientesActivos,
        COALESCE((SELECT SUM(total) FROM Pedido WHERE estado IN ('pagado', 'Entregado')) / (SELECT COUNT(idPedido) FROM Pedido WHERE estado IN ('pagado', 'Entregado')), 0) AS ticketPromedio
      FROM Pedido
      WHERE DATE(fechaPedido) = CURDATE()
        AND estado IN ('pagado', 'Entregado', 'pendiente')
    `;
    const [filas] = await pool.query(query);
    return {
      ventasHoy: parseFloat(filas[0].ventasHoy),
      pedidosHoy: parseInt(filas[0].pedidosHoy, 10),
      clientesActivos: parseInt(filas[0].clientesActivos, 10),
      ticketPromedio: parseFloat(filas[0].ticketPromedio)
    };
  }

  /**
   * Actualiza el estado de un pedido en la tabla Pedido de la base de datos MySQL.
   */
  static async actualizarEstado(idPedido, estado) {
    const query = 'UPDATE Pedido SET estado = ? WHERE idPedido = ?';
    const [resultado] = await pool.query(query, [estado, idPedido]);
    return resultado.affectedRows > 0;
  }
}

module.exports = PedidoModelo;
