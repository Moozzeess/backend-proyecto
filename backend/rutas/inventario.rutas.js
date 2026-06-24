const express = require('express');
const router = express.Router();
const InventarioControlador = require('../controladores/inventario.controlador');

/**
 * Rutas para la gestión de insumos e ingredientes del almacén
 */
router.get('/', InventarioControlador.obtenerTodos);
router.post('/:id/reabastecer', InventarioControlador.reabastecer);

module.exports = router;
