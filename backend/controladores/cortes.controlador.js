const CortesServicio = require('../servicios/cortes.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: CortesControlador
 * Intención: Mediar las solicitudes HTTP de arqueo y aprobación de cortes de caja en el panel.
 */
class CortesControlador {
  /**
   * Obtiene todos los cortes de caja del personal.
   */
  static async obtenerTodos(req, res, next) {
    try {
      const cortes = await CortesServicio.listarTodos();
      res.json({
        exito: true,
        datos: cortes
      });
    } catch (error) {
      registrador.error('Error en CortesControlador.obtenerTodos', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Modifica el estado de aprobación de un corte de caja.
   */
  static async aprobar(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const exito = await CortesServicio.aprobarCorte(id, estado);
      res.json({
        exito,
        mensaje: exito ? 'Estado de corte de caja actualizado.' : 'No se pudo actualizar el estado.'
      });
    } catch (error) {
      registrador.error('Error en CortesControlador.aprobar', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = CortesControlador;
