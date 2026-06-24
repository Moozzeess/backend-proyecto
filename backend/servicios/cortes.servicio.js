const CorteCajaModelo = require('../modelos/corte-caja.modelo');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Servicio: CortesServicio
 * Intención: Alojar la lógica de negocio para la revisión y aprobación de los cortes de caja realizados por los empleados.
 */
class CortesServicio {
  /**
   * Obtiene la lista completa de cortes de caja.
   * Intención: Retornar los cortes de caja de la base de datos real.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array>} Listado de cortes.
   */
  static async listarTodos() {
    return await CorteCajaModelo.obtenerTodos();
  }

  /**
   * Cambia el estado de aprobación de un corte de caja y audita el evento.
   * Intención: Aprobar o denegar el arqueo de caja de un empleado.
   * Parámetros:
   *   - idCorte (string): Folio del corte de caja.
   *   - nuevoEstado (string): Nuevo estatus (ej. 'Aprobado', 'Rechazado').
   * Retorno: {Promise<boolean>} True si fue modificado.
   */
  static async aprobarCorte(idCorte, nuevoEstado = 'Aprobado') {
    if (!idCorte) {
      throw new Error('ID de corte de caja requerido.');
    }

    const exito = await CorteCajaModelo.actualizarEstado(idCorte, nuevoEstado);

    if (exito) {
      registrador.info(`AUDITORÍA: El administrador modificó el estado del corte de caja con ID: ${idCorte} a ${nuevoEstado}`);
    }

    return exito;
  }
}

module.exports = CortesServicio;
