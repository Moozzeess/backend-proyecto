const express = require('express');
const router = express.Router();
const CortesControlador = require('../controladores/cortes.controlador');

/**
 * Rutas para visualizar y aprobar los balances y arqueos de caja
 */
router.get('/', CortesControlador.obtenerTodos);
router.patch('/:id/aprobar', CortesControlador.aprobar);

module.exports = router;
