const InventarioServicio = require('../servicios/inventario.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: InventarioControlador
 * Intención: Mediar las solicitudes HTTP de inventario y reabastecimiento en el almacén.
 */
class InventarioControlador {
  /**
   * Obtiene todos los insumos de ingredientes del inventario.
   */
  static async obtenerTodos(req, res, next) {
    try {
      const ingredientes = await InventarioServicio.listarTodos();
      res.json({
        exito: true,
        datos: ingredientes
      });
    } catch (error) {
      registrador.error('Error en InventarioControlador.obtenerTodos', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Reabastece un ingrediente específico incrementando su stock en lote.
   */
  static async reabastecer(req, res, next) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      const exito = await InventarioServicio.reabastecer(parseInt(id, 10), cantidad);
      res.json({
        exito,
        mensaje: exito ? 'Ingrediente reabastecido con éxito.' : 'No se pudo realizar el reabastecimiento.'
      });
    } catch (error) {
      registrador.error('Error en InventarioControlador.reabastecer', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = InventarioControlador;
