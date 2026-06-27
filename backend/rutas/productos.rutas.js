const express = require('express');
const router = express.Router();
const ProductosControlador = require('../controladores/productos.controlador');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para el catálogo de productos
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos del catálogo
 *     tags: [Productos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de productos disponibles
 */
router.get('/', ProductosControlador.obtenerProductos);

module.exports = router;