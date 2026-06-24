const express = require('express');
const router = express.Router();
const EmpleadosControlador = require('../controladores/empleados.controlador');

/**
 * Rutas para la gestión de empleados en el panel de administrador
 */
router.get('/', EmpleadosControlador.obtenerTodos);
router.post('/', EmpleadosControlador.registrar);
router.put('/:id', EmpleadosControlador.actualizar);
router.patch('/:id/conmutar-estatus', EmpleadosControlador.conmutarEstatus);

module.exports = router;
