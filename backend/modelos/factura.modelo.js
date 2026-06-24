const { pool } = require('../configuracion/conexion');

/**
 * Modelo: FacturaModelo
 * Intención: Administrar e interactuar con la tabla Factura en MySQL.
 */
class FacturaModelo {
  /**
   * Obtiene la lista completa de facturas emitidas por la pizzería.
   * Intención: Listar las facturas en el módulo de facturación del administrador.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array<Object>>} Listado de facturas.
   */
  static async obtenerTodas() {
    const query = `
      SELECT idFactura AS id, DATE_FORMAT(fechaHora, '%Y-%m-%d %H:%i') AS fechaHora,
             pedidoId, rfc, razonSocial, usoCfdi, total, estado
      FROM Factura
      ORDER BY fechaHora DESC
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({
      ...f,
      total: parseFloat(f.total),
      pedidoId: `#${f.pedidoId}`
    }));
  }

  /**
   * Registra una nueva factura fiscal en el sistema vinculada a un pedido entregado.
   * Intención: Registrar la emisión de la factura en MySQL.
   * Parámetros:
   *   - datos (Object): Datos del receptor (id, rfc, razonSocial, usoCfdi, total, pedidoId).
   * Retorno: {Promise<string>} Folio generado de la factura.
   */
  static async crear(datos) {
    const { idFactura, pedidoId, rfc, razonSocial, usoCfdi, total } = datos;
    const cleanPedidoId = parseInt(pedidoId.toString().replace('#', ''), 10);

    const query = `
      INSERT INTO Factura (idFactura, pedidoId, rfc, razonSocial, usoCfdi, total, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'Emitida')
    `;
    await pool.query(query, [idFactura, cleanPedidoId, rfc, razonSocial, usoCfdi, total]);
    return idFactura;
  }

  /**
   * Cambia el estado de una factura a 'Cancelada'.
   * Intención: Cancelar fiscalmente una factura.
   * Parámetros:
   *   - idFactura (string): Folio de la factura.
   * Retorno: {Promise<boolean>} True si fue cancelada con éxito.
   */
  static async cancelar(idFactura) {
    const query = 'UPDATE Factura SET estado = \'Cancelada\' WHERE idFactura = ?';
    const [resultado] = await pool.query(query, [idFactura]);
    return resultado.affectedRows > 0;
  }

  /**
   * Verifica si ya existe una factura activa emitida para un pedido.
   * Intención: Prevenir la doble facturación de un pedido.
   * Parámetros:
   *   - pedidoId (number): ID numérico del pedido.
   * Retorno: {Promise<Object|null>} Factura si ya existe, de lo contrario null.
   */
  static async buscarPorPedido(pedidoId) {
    const query = 'SELECT idFactura, estado FROM Factura WHERE pedidoId = ? AND estado = \'Emitida\' LIMIT 1';
    const [filas] = await pool.query(query, [pedidoId]);
    return filas.length > 0 ? filas[0] : null;
  }
}

module.exports = FacturaModelo;
