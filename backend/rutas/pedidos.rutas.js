const express = require('express');
const router = express.Router();
const PedidosControlador = require('../controladores/pedidos.controlador');
const { verificarToken, permitirRoles, verificarPropietarioOAdmin } = require('../middlewares/autenticacion.middleware');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Endpoints para gestión de pedidos
 */

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCliente:
 *                 type: integer
 *                 example: 4
 *               idSucursal:
 *                 type: integer
 *                 example: 1
 *               total:
 *                 type: number
 *                 example: 250.00
 *               metodoEntrega:
 *                 type: string
 *                 example: domicilio
 *               direccion:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               metodoPago:
 *                 type: string
 *                 example: efectivo
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idProducto:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precioUnitario:
 *                       type: number
 *                     nombre:
 *                       type: string
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', verificarToken, permitirRoles('administrador', 'empleado', 'cliente'), PedidosControlador.crear);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los pedidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador y empleado)
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.obtenerTodos);

/**
 * @swagger
 * /pedidos/{idPedido}/estado:
 *   patch:
 *     summary: Actualizar estado de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPedido
 *         required: true
 *         schema:
 *           type: string
 *         example: "12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 example: Entregado
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.patch('/:idPedido/estado', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.actualizarEstado);

/**
 * @swagger
 * /pedidos/historial/{idCliente}:
 *   get:
 *     summary: Obtener historial de pedidos de un cliente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCliente
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *     responses:
 *       200:
 *         description: Historial de pedidos del cliente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo el propio cliente o administrador)
 */
router.get('/historial/:idCliente', verificarToken, verificarPropietarioOAdmin('idCliente'), PedidosControlador.obtenerHistorial);

/**
 * @swagger
 * /pedidos/{idPedido}/reenviar-correo:
 *   post:
 *     summary: Reenviar correo de confirmación de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idPedido
 *         required: true
 *         schema:
 *           type: string
 *         example: "12"
 *     responses:
 *       200:
 *         description: Correo reenviado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/:idPedido/reenviar-correo', verificarToken, permitirRoles('administrador', 'empleado'), PedidosControlador.reenviarCorreo);

/**
 * @swagger
 * /pedidos/estadisticas/ventas:
 *   get:
 *     summary: Obtener estadísticas de ventas semanales
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas por período
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.get('/estadisticas/ventas', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerEstadisticasVentas);

/**
 * @swagger
 * /pedidos/estadisticas/productos:
 *   get:
 *     summary: Obtener estadísticas de productos más vendidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos por popularidad
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.get('/estadisticas/productos', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerEstadisticasProductos);

/**
 * @swagger
 * /pedidos/kpis:
 *   get:
 *     summary: Obtener KPIs financieros diarios
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs del día (ventas, pedidos, clientes, ticket promedio)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.get('/kpis', verificarToken, permitirRoles('administrador'), PedidosControlador.obtenerKpis);

module.exports = router;