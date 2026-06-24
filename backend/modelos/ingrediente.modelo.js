const { pool } = require('../configuracion/conexion');

/**
 * Modelo: IngredienteModelo
 * Intención: Interactuar con la tabla Ingrediente para la administración del inventario y existencias.
 */
class IngredienteModelo {
  /**
   * Obtiene la lista completa de ingredientes del inventario de insumos.
   * Intención: Listar insumos en el panel de inventario del administrador.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array<Object>>} Lista de ingredientes.
   */
  static async obtenerTodos() {
    const query = `
      SELECT idIngrediente AS id, nombre, stockActual, stockMinimo, unidad
      FROM Ingrediente
      ORDER BY idIngrediente ASC
    `;
    const [filas] = await pool.query(query);
    return filas;
  }

  /**
   * Reabastece las existencias de un ingrediente sumando un lote predefinido.
   * Intención: Agregar inventario de insumos.
   * Parámetros:
   *   - id (number): ID único del ingrediente.
   *   - cantidad (number): Cantidad física de insumos a sumar.
   * Retorno: {Promise<boolean>} Retorna true si se sumó el stock con éxito.
   */
  static async sumarStock(id, cantidad) {
    const query = `
      UPDATE Ingrediente
      SET stockActual = stockActual + ?
      WHERE idIngrediente = ?
    `;
    const [resultado] = await pool.query(query, [cantidad, id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = IngredienteModelo;
