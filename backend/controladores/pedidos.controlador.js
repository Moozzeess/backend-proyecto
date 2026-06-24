const PedidosServicio = require('../servicios/pedidos.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: PedidosControlador
 * Intención: Mediar las peticiones HTTP relativas a la compra e historial de pedidos.
 */
class PedidosControlador {
  /**
   * Intención: Registrar un nuevo pedido.
   * Parámetros: req, res, next.
   */
  static async crear(req, res, next) {
    try {
      const { idCliente, idSucursal, total, productos, metodoEntrega, direccion, telefono, metodoPago } = req.body;
      if (!idCliente || !total || !productos || productos.length === 0) {
        return res.status(400).json({
          exito: false,
          codigo: 'DATOS_INCOMPLETOS',
          mensaje: 'Faltan parámetros esenciales para registrar la orden.'
        });
      }

      const idPedido = await PedidosServicio.crearPedido(idCliente, idSucursal || 1, total, productos);

      // Enviar correo de confirmación del pedido de forma asíncrona
      try {
        const UsuarioModelo = require('../modelos/usuario.modelo');
        const clienteDatos = await UsuarioModelo.buscarPorIdCliente(idCliente);
        if (clienteDatos) {
          const { desencriptarCorreo } = require('../utilidades/encriptacion.utilidad');
          const correoLimpio = desencriptarCorreo(clienteDatos.correo);
          const CorreoServicio = require('../servicios/correo.servicio');

          // Estructurar productos con nombres legibles para el cuerpo del correo
          const productosDetallados = productos.map(p => ({
            cantidad: p.cantidad,
            producto: {
              nombre: p.nombre || 'Especialidad Pizza Pizza',
              precio: p.precioUnitario
            }
          }));

          // Invocar el servicio de envío del correo de forma no bloqueante
          CorreoServicio.enviarCorreoPedido(correoLimpio, {
            id: `#${idPedido}`,
            total,
            metodoEntrega: metodoEntrega === 'domicilio' ? 'a domicilio' : metodoEntrega,
            direccion: metodoEntrega === 'domicilio' ? direccion : 'Sucursal Principal',
            telefono: telefono,
            metodoPago: metodoPago || 'Efectivo',
            productos: productosDetallados
          });
        }
      } catch (errEmail) {
        registrador.error('Error al enviar correo de confirmación de pedido', { mensaje: errEmail.message });
      }

      res.status(201).json({
        exito: true,
        datos: { idPedido }
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.crear', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Intención: Obtener el historial de pedidos de un cliente.
   * Parámetros: req, res, next.
   */
  static async obtenerHistorial(req, res, next) {
    try {
      const { idCliente } = req.params;
      if (!idCliente) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Se requiere el ID del cliente.'
        });
      }

      const historial = await PedidosServicio.obtenerHistorialCliente(parseInt(idCliente, 10));
      res.json({
        exito: true,
        datos: historial
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerHistorial', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Intención: Buscar un pedido por ID y reenviar su correo de confirmación al cliente.
   * Parámetros:
   *   - req (Object): Petición HTTP.
   *   - res (Object): Respuesta HTTP.
   *   - next (Function): Siguiente middleware.
   * Retorno: Promise<void>
   */
  static async reenviarCorreo(req, res, next) {
    try {
      const { idPedido } = req.params;
      const cleanId = idPedido.replace('#', '');
      
      const PedidoModelo = require('../modelos/pedido.modelo');
      const filas = await PedidoModelo.buscarPorId(parseInt(cleanId, 10));

      if (!filas || filas.length === 0) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontró el pedido solicitado.'
        });
      }

      const primerFila = filas[0];
      const idCliente = primerFila.idCliente;

      const UsuarioModelo = require('../modelos/usuario.modelo');
      const clienteDatos = await UsuarioModelo.buscarPorIdCliente(idCliente);

      if (!clienteDatos) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontraron los datos del cliente.'
        });
      }

      const { desencriptarCorreo } = require('../utilidades/encriptacion.utilidad');
      const correoLimpio = desencriptarCorreo(clienteDatos.correo);
      const CorreoServicio = require('../servicios/correo.servicio');

      const productosDetallados = filas.map(f => ({
        cantidad: f.cantidad,
        producto: {
          nombre: f.nombre,
          precio: parseFloat(f.precioUnitario)
        }
      }));

      await CorreoServicio.enviarCorreoPedido(correoLimpio, {
        id: `#${primerFila.id}`,
        total: parseFloat(primerFila.total),
        metodoEntrega: 'a domicilio',
        direccion: 'Dirección Registrada',
        telefono: 'Teléfono Registrado',
        productos: productosDetallados
      });

      res.json({
        exito: true,
        mensaje: 'Correo reenviado exitosamente.'
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.reenviarCorreo', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Obtiene estadísticas agregadas de ventas semanales.
   */
  static async obtenerEstadisticasVentas(req, res, next) {
    try {
      const datos = await PedidosServicio.obtenerVentasSemanales();
      res.json({
        exito: true,
        datos
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerEstadisticasVentas', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Obtiene estadísticas agregadas de productos más vendidos.
   */
  static async obtenerEstadisticasProductos(req, res, next) {
    try {
      const datos = await PedidosServicio.obtenerProductosMasVendidos();
      res.json({
        exito: true,
        datos
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerEstadisticasProductos', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Obtiene los KPIs financieros resumidos del día de hoy.
   */
  static async obtenerKpis(req, res, next) {
    try {
      const datos = await PedidosServicio.obtenerKpis();
      res.json({
        exito: true,
        datos
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerKpis', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Obtiene todos los pedidos registrados en el sistema de forma consolidada.
   */
  static async obtenerTodos(req, res, next) {
    try {
      const pedidos = await PedidosServicio.obtenerTodosConsolidados();
      res.json({
        exito: true,
        datos: pedidos
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.obtenerTodos', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Actualiza el estado de un pedido específico.
   */
  static async actualizarEstado(req, res, next) {
    try {
      const { idPedido } = req.params;
      const { estado } = req.body;
      if (!idPedido || !estado) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Faltan parámetros esenciales para actualizar el estado del pedido.'
        });
      }

      const cleanId = idPedido.replace('#', '');
      const exito = await PedidosServicio.actualizarEstado(parseInt(cleanId, 10), estado);
      res.json({
        exito,
        mensaje: exito ? 'Estado del pedido actualizado correctamente.' : 'No se pudo actualizar el estado.'
      });
    } catch (error) {
      registrador.error('Error en PedidosControlador.actualizarEstado', { mensaje: error.message });
      next(error);
    }
  }
}

module.exports = PedidosControlador;
