const express = require('express');
const router = express.Router();

const productosRutas = require('./productos.rutas');
const autenticacionRutas = require('./autenticacion.rutas');
const pedidosRutas = require('./pedidos.rutas');
const empleadosRutas = require('./empleados.rutas');
const sucursalesRutas = require('./sucursales.rutas');
const inventarioRutas = require('./inventario.rutas');
const facturasRutas = require('./facturas.rutas');
const cortesRutas = require('./cortes.rutas');

/**
 * Mapeo de rutas raíz a sub-rutas específicas del sistema
 */
router.use('/productos', productosRutas);
router.use('/autenticacion', autenticacionRutas);
router.use('/pedidos', pedidosRutas);
router.use('/empleados', empleadosRutas);
router.use('/sucursales', sucursalesRutas);
router.use('/inventario', inventarioRutas);
router.use('/facturas', facturasRutas);
router.use('/cortes', cortesRutas);

module.exports = router;
