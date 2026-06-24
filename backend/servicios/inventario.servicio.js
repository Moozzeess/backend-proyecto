const IngredienteModelo = require('../modelos/ingrediente.modelo');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Servicio: InventarioServicio
 * Intención: Alojar la lógica de negocio para la gestión de insumos del inventario físico.
 */
class InventarioServicio {
  /**
   * Obtiene la lista completa de ingredientes del almacén.
   * Intención: Retornar todos los insumos físicos.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array>} Lista de insumos.
   */
  static async listarTodos() {
    return await IngredienteModelo.obtenerTodos();
  }

  /**
   * Reabastece un ingrediente específico incrementando su stock actual.
   * Intención: Registrar la entrada física de insumos y auditar la operación.
   * Parámetros:
   *   - idIngrediente (number): ID único del ingrediente.
   *   - cantidad (number): Cantidad agregada al stock.
   * Retorno: {Promise<boolean>} True si fue exitoso.
   */
  static async reabastecer(idIngrediente, cantidad = 10) {
    if (!idIngrediente || cantidad <= 0) {
      throw new Error('ID de ingrediente inválido o cantidad de reabastecimiento incorrecta.');
    }

    const exito = await IngredienteModelo.sumarStock(idIngrediente, cantidad);

    if (exito) {
      registrador.info(`AUDITORÍA: El administrador reabasteció el stock del ingrediente ID: ${idIngrediente} añadiendo +${cantidad} unidades.`);
    }

    return exito;
  }
}

module.exports = InventarioServicio;
