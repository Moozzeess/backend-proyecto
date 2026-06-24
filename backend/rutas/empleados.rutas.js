const express = require('express');
const router = express.Router();
const EmpleadosControlador = require('../controladores/empleados.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * Rutas para la gestión de empleados en el panel de administrador
 */
router.get('/', verificarToken, permitirRoles('administrador'), EmpleadosControlador.obtenerTodos);
router.post('/', verificarToken, permitirRoles('administrador'), EmpleadosControlador.registrar);
router.put('/:id', verificarToken, permitirRoles('administrador'), EmpleadosControlador.actualizar);
router.patch('/:id/conmutar-estatus', verificarToken, permitirRoles('administrador'), EmpleadosControlador.conmutarEstatus);

module.exports = router;
