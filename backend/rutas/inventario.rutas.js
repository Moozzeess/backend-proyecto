const express = require('express');
const router = express.Router();
const InventarioControlador = require('../controladores/inventario.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Endpoints para gestión de insumos e ingredientes del almacén
 */

/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtener todos los insumos del inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de insumos e ingredientes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador y empleado)
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), InventarioControlador.obtenerTodos);

/**
 * @swagger
 * /inventario/{id}/reabastecer:
 *   post:
 *     summary: Reabastecer un insumo del inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Insumo reabastecido exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador y empleado)
 */
router.post('/:id/reabastecer', verificarToken, permitirRoles('administrador', 'empleado'), InventarioControlador.reabastecer);

module.exports = router;