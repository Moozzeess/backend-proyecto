const express = require('express');
const router = express.Router();
const FacturasControlador = require('../controladores/facturas.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Endpoints para emisión y gestión de facturas fiscales
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas emitidas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador y empleado)
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.obtenerTodas);

/**
 * @swagger
 * /facturas/emitir:
 *   post:
 *     summary: Emitir una nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pedidoId:
 *                 type: string
 *                 example: "12"
 *               rfc:
 *                 type: string
 *                 example: XAXX010101000
 *               razonSocial:
 *                 type: string
 *                 example: Público General
 *               codigoPostal:
 *                 type: string
 *                 example: "06600"
 *               usoCfdi:
 *                 type: string
 *                 example: G03
 *               regimenFiscal:
 *                 type: string
 *                 example: "616"
 *               correo:
 *                 type: string
 *                 example: cliente@correo.com
 *     responses:
 *       201:
 *         description: Factura emitida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/emitir', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.emitir);

/**
 * @swagger
 * /facturas/{id}/cancelar:
 *   patch:
 *     summary: Cancelar una factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Factura cancelada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.patch('/:id/cancelar', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.cancelar);

module.exports = router;