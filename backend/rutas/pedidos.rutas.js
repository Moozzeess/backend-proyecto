const express = require('express');
const router = express.Router();
const PedidosControlador = require('../controladores/pedidos.controlador');
const { verificarToken, permitirRoles, verificarPropietarioOAdmin } = require('../middlewares/autenticacion.middleware');

/**
 * Rutas de pedidos
 */
router.post('/', verificarToken, permitirRoles('administrador', 'empleado', 'cliente'), PedidosControlador.crear);
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.obtenerTodos);
router.patch('/:idPedido/estado', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.actualizarEstado);
router.get('/historial/:idCliente', verificarToken, verificarPropietarioOAdmin('idCliente'), PedidosControlador.obtenerHistorial);
router.post('/:idPedido/reenviar-correo', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.reenviarCorreo);
router.get('/estadisticas/ventas', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerEstadisticasVentas);
router.get('/estadisticas/productos', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerEstadisticasProductos);
router.get('/kpis', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerKpis);

module.exports = router;
