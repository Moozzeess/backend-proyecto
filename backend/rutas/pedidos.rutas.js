const express = require('express');
const router = express.Router();
const PedidosControlador = require('../controladores/pedidos.controlador');

/**
 * Rutas de pedidos
 */
router.post('/', PedidosControlador.crear);
router.get('/', PedidosControlador.obtenerTodos);
router.patch('/:idPedido/estado', PedidosControlador.actualizarEstado);
router.get('/historial/:idCliente', PedidosControlador.obtenerHistorial);
router.post('/:idPedido/reenviar-correo', PedidosControlador.reenviarCorreo);
router.get('/estadisticas/ventas', PedidosControlador.obtenerEstadisticasVentas);
router.get('/estadisticas/productos', PedidosControlador.obtenerEstadisticasProductos);
router.get('/kpis', PedidosControlador.obtenerKpis);

module.exports = router;
