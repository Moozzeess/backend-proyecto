const FacturaModelo = require('../modelos/factura.modelo');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Servicio: FacturacionServicio
 * Intención: Alojar la lógica de negocio para la emisión, validación y cancelación de facturas.
 */
class FacturacionServicio {
  /**
   * Obtiene todas las facturas registradas en la base de datos MySQL.
   * Intención: Retornar las facturas de la pizzería.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array>} Listado de facturas.
   */
  static async listarFacturas() {
    return await FacturaModelo.obtenerTodas();
  }

  /**
   * Genera e inserta una factura real vinculada a un pedido específico.
   * Intención: Validar, emitir y auditar la creación de una factura.
   * Parámetros:
   *   - datos (Object): RFC, razón social, CFDI, ID de pedido y total.
   * Retorno: {Promise<string>} Folio de la factura creada.
   */
  static async emitir(datos) {
    const { pedidoId, rfc, razonSocial, usoCfdi, total } = datos;

    if (!pedidoId || !rfc || !razonSocial || !total) {
      throw new Error('Faltan parámetros esenciales para facturar el pedido.');
    }

    const cleanPedidoId = parseInt(pedidoId.toString().replace('#', ''), 10);

    // Validar si ya cuenta con una factura activa
    const facturaActiva = await FacturaModelo.buscarPorPedido(cleanPedidoId);
    if (facturaActiva) {
      throw new Error(`El pedido ya cuenta con una factura activa bajo el folio ${facturaActiva.idFactura}.`);
    }

    // Folio fiscal simulado
    const folio = 'FAC-' + Math.floor(1000 + Math.random() * 9000);

    await FacturaModelo.crear({
      idFactura: folio,
      pedidoId: cleanPedidoId,
      rfc,
      razonSocial,
      usoCfdi,
      total
    });

    registrador.info(`AUDITORÍA: Factura ${folio} emitida con éxito para el pedido ${pedidoId}. RFC Receptor: ${rfc}, Razón Social: ${razonSocial}, Total: $${total}`);

    return folio;
  }

  /**
   * Cancela una factura existente en el sistema.
   * Intención: Anular la factura y registrar auditoría.
   * Parámetros:
   *   - idFactura (string): Folio de la factura.
   * Retorno: {Promise<boolean>} True si se canceló.
   */
  static async cancelarFactura(idFactura) {
    if (!idFactura) {
      throw new Error('ID de factura requerido para la cancelación.');
    }

    const exito = await FacturaModelo.cancelar(idFactura);

    if (exito) {
      registrador.warn(`AUDITORÍA: El administrador canceló la factura con folio: ${idFactura}`);
    }

    return exito;
  }
}

module.exports = FacturacionServicio;
