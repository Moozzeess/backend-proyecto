const { pool } = require('../configuracion/conexion');

/**
 * Modelo: SucursalModelo
 * Intención: Interactuar con la tabla Sucursal y calcular ventas agregadas de la base de datos MySQL.
 */
class SucursalModelo {
  /**
   * Obtiene la lista de todas las sucursales del negocio incluyendo cálculos agregados de ventas reales de los pedidos.
   * Intención: Presentar el listado de sucursales con su respectivo rendimiento de ventas para el administrador.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array<Object>>} Listado de sucursales procesado.
   */
  static async obtenerTodas() {
    const query = `
      SELECT s.idSucursal AS id, s.nombre, s.direccion, s.telefono,
             'Administrador General' AS administrador,
             COALESCE(SUM(p.total), 0) AS ventasTotales
      FROM Sucursal s
      LEFT JOIN Pedido p ON s.idSucursal = p.idSucursal AND p.estado IN ('pagado', 'Entregado')
      GROUP BY s.idSucursal, s.nombre, s.direccion, s.telefono
      ORDER BY s.idSucursal ASC
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({
      ...f,
      ventasTotales: parseFloat(f.ventasTotales)
    }));
  }
}

module.exports = SucursalModelo;
