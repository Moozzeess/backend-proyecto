const SucursalModelo = require('../modelos/sucursal.modelo');

/**
 * Servicio: SucursalesServicio
 * Intención: Alojar la lógica de negocio para la consulta de información de las sucursales del negocio.
 */
class SucursalesServicio {
  /**
   * Obtiene el listado de todas las sucursales con cálculos en tiempo real.
   * Intención: Retornar las sucursales con sus ventas agregadas correspondientes.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array>} Listado de sucursales.
   */
  static async listarTodas() {
    return await SucursalModelo.obtenerTodas();
  }
}

module.exports = SucursalesServicio;
