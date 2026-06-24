const express = require('express');
const router = express.Router();
const FacturasControlador = require('../controladores/facturas.controlador');

/**
 * Rutas para emitir, listar y cancelar facturas fiscales
 */
router.get('/', FacturasControlador.obtenerTodas);
router.post('/emitir', FacturasControlador.emitir);
router.patch('/:id/cancelar', FacturasControlador.cancelar);

module.exports = router;
