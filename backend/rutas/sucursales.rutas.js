const express = require('express');
const router = express.Router();
const SucursalesControlador = require('../controladores/sucursales.controlador');

/**
 * Rutas para consultar sucursales y sus ingresos
 */
router.get('/', SucursalesControlador.obtenerTodas);

module.exports = router;
