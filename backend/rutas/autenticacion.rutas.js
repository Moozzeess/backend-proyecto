const express = require('express');
const router = express.Router();
const AutenticacionControlador = require('../controladores/autenticacion.controlador');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para login y registro de usuarios
 */

/**
 * @swagger
 * /autenticacion/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 example: usuario@correo.com
 *               contrasena:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT y datos del usuario
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', AutenticacionControlador.login);

/**
 * @swagger
 * /autenticacion/registro:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *               - contrasena
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               correo:
 *                 type: string
 *                 example: juan@correo.com
 *               contrasena:
 *                 type: string
 *                 example: "123456"
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               direccion:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/registro', AutenticacionControlador.registro);

module.exports = router;