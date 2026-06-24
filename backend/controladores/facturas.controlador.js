const FacturacionServicio = require('../servicios/facturacion.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: FacturasControlador
 * Intención: Mediar las solicitudes HTTP de emisión y cancelación de facturas fiscales del administrador.
 */
class FacturasControlador {
  /**
   * Obtiene todas las facturas del sistema.
   */
  static async obtenerTodas(req, res, next) {
    try {
      const facturas = await FacturacionServicio.listarFacturas();
      res.json({
        exito: true,
        datos: facturas
      });
    } catch (error) {
      registrador.error('Error en FacturasControlador.obtenerTodas', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Genera e inserta una factura real vinculada a un pedido entregado.
   */
  static async emitir(req, res, next) {
    try {
      const folio = await FacturacionServicio.emitir(req.body);
      res.status(201).json({
        exito: true,
        datos: { folio }
      });
    } catch (error) {
      registrador.error('Error en FacturasControlador.emitir', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Cancela una factura.
   */
  static async cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const exito = await FacturacionServicio.cancelarFactura(id);
      res.json({
        exito,
        mensaje: exito ? 'Factura cancelada correctamente.' : 'No se pudo realizar la cancelación.'
      });
    } catch (error) {
      registrador.error('Error en FacturasControlador.cancelar', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = FacturasControlador;
