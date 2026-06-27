const express = require('express');
const router = express.Router();
const CortesControlador = require('../controladores/cortes.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * @swagger
 * tags:
 *   name: Cortes de Caja
 *   description: Endpoints para gestión de cortes de caja
 */

/**
 * @swagger
 * /cortes:
 *   get:
 *     summary: Obtener todos los cortes de caja
 *     tags: [Cortes de Caja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cortes de caja
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador y empleado)
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), CortesControlador.obtenerTodos);

/**
 * @swagger
 * /cortes/{id}/aprobar:
 *   patch:
 *     summary: Aprobar un corte de caja
 *     tags: [Cortes de Caja]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 example: Aprobado
 *     responses:
 *       200:
 *         description: Corte aprobado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.patch('/:id/aprobar', verificarToken, permitirRoles('administrador'), CortesControlador.aprobar);

module.exports = router;