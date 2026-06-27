const express = require('express');
const router = express.Router();
const SucursalesControlador = require('../controladores/sucursales.controlador');

/**
 * @swagger
 * tags:
 *   name: Sucursales
 *   description: Endpoints para consulta de sucursales
 */

/**
 * @swagger
 * /sucursales:
 *   get:
 *     summary: Obtener todas las sucursales
 *     tags: [Sucursales]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de sucursales disponibles
 */
router.get('/', SucursalesControlador.obtenerTodas);

module.exports = router;