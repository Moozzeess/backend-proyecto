const express = require('express');
const router = express.Router();
const FacturasControlador = require('../controladores/facturas.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * Rutas para emitir, listar y cancelar facturas fiscales
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.obtenerTodas);
router.post('/emitir', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.emitir);
router.patch('/:id/cancelar', verificarToken, permitirRoles('administrador', 'empleado'), FacturasControlador.cancelar);

module.exports = router;
