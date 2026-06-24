const express = require('express');
const router = express.Router();
const InventarioControlador = require('../controladores/inventario.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * Rutas para la gestión de insumos e ingredientes del almacén
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), InventarioControlador.obtenerTodos);
router.post('/:id/reabastecer', verificarToken, permitirRoles('administrador', 'empleado'), InventarioControlador.reabastecer);

module.exports = router;
