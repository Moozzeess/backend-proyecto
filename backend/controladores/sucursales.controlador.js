const SucursalesServicio = require('../servicios/sucursales.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: SucursalesControlador
 * Intención: Mediar las solicitudes HTTP relacionadas con la información de las sucursales.
 */
class SucursalesControlador {
  /**
   * Obtiene la lista de todas las sucursales.
   */
  static async obtenerTodas(req, res, next) {
    try {
      const sucursales = await SucursalesServicio.listarTodas();
      res.json({
        exito: true,
        datos: sucursales
      });
    } catch (error) {
      registrador.error('Error en SucursalesControlador.obtenerTodas', { mensaje: error.message });
      next(error);
    }
  }
}

module.exports = SucursalesControlador;
