const express = require('express');
const router = express.Router();
const EmpleadosControlador = require('../controladores/empleados.controlador');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion.middleware');

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Endpoints para gestión de empleados (solo administrador)
 */

/**
 * @swagger
 * /empleados:
 *   get:
 *     summary: Obtener todos los empleados
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.get('/', verificarToken, permitirRoles('administrador'), EmpleadosControlador.obtenerTodos);

/**
 * @swagger
 * /empleados:
 *   post:
 *     summary: Registrar un nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: María
 *               apellido:
 *                 type: string
 *                 example: López
 *               correo:
 *                 type: string
 *                 example: maria@pizzapizza.com
 *               contrasena:
 *                 type: string
 *                 example: "123456"
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               puesto:
 *                 type: string
 *                 example: Cajero
 *     responses:
 *       201:
 *         description: Empleado registrado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.post('/', verificarToken, permitirRoles('administrador'), EmpleadosControlador.registrar);

/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     summary: Actualizar datos de un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: María
 *               apellido:
 *                 type: string
 *                 example: López
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               puesto:
 *                 type: string
 *                 example: Gerente
 *     responses:
 *       200:
 *         description: Empleado actualizado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.put('/:id', verificarToken, permitirRoles('administrador'), EmpleadosControlador.actualizar);

/**
 * @swagger
 * /empleados/{id}/conmutar-estatus:
 *   patch:
 *     summary: Activar o desactivar un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatus del empleado actualizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (solo administrador)
 */
router.patch('/:id/conmutar-estatus', verificarToken, permitirRoles('administrador'), EmpleadosControlador.conmutarEstatus);

module.exports = router;