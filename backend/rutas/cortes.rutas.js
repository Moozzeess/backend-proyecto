const express = require('express');
const router = express.Router();
const CortesControlador = require('../controladores/cortes.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * Rutas para visualizar y aprobar los balances y arqueos de caja
 */
router.get('/', verificarToken, permitirRoles('administrador', 'empleado'), CortesControlador.obtenerTodos);
router.patch('/:id/aprobar', verificarToken, permitirRoles('administrador'), CortesControlador.aprobar);

module.exports = router;
