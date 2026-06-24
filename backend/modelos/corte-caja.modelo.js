const { pool } = require('../configuracion/conexion');

/**
 * Modelo: CorteCajaModelo
 * Intención: Administrar e interactuar con la tabla CorteCaja en MySQL.
 */
class CorteCajaModelo {
  /**
   * Obtiene la lista completa de cortes de caja de los cajeros.
   * Intención: Listar los cortes de caja para que el administrador los apruebe.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array<Object>>} Listado de cortes.
   */
  static async obtenerTodos() {
    const query = `
      SELECT cc.idCorte AS id, DATE_FORMAT(cc.fecha, '%Y-%m-%d') AS fecha,
             CONCAT(e.nombre, ' ', e.apellido) AS empleado,
             cc.totalVentas, cc.cantidadPedidos, cc.observaciones, cc.estado
      FROM CorteCaja cc
      JOIN Empleado e ON cc.idEmpleado = e.idEmpleado
      ORDER BY cc.fecha DESC
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({
      ...f,
      totalVentas: parseFloat(f.totalVentas)
    }));
  }

  /**
   * Modifica el estado de un corte de caja (ej. 'Aprobado').
   * Intención: Permitir al administrador aprobar el balance final del cajero.
   * Parámetros:
   *   - idCorte (string): Folio del corte.
   *   - nuevoEstado (string): Estado a asignar.
   * Retorno: {Promise<boolean>} True si fue modificado con éxito.
   */
  static async actualizarEstado(idCorte, nuevoEstado) {
    const query = 'UPDATE CorteCaja SET estado = ? WHERE idCorte = ?';
    const [resultado] = await pool.query(query, [nuevoEstado, idCorte]);
    return resultado.affectedRows > 0;
  }
}

module.exports = CorteCajaModelo;
