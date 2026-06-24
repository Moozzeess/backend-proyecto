const mysql = require('mysql2/promise');
const registrador = require('../utilidades/registrador.utilidad');
require('dotenv').config();

/**
 * Configuración del pool de conexiones para la base de datos MySQL.
 * Configurado utilizando variables de entorno.
 */
const configuracionPool = {
  host: process.env.BD_HOST,
  user: process.env.BD_USUARIO,
  password: process.env.BD_CONTRASENA,
  database: process.env.BD_NOMBRE,
  port: parseInt(process.env.BD_PUERTO, 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

/**
 * Pool de conexiones para la base de datos MySQL.
 */
const pool = mysql.createPool(configuracionPool);

/**
 * Verifica la conexión activa con el servidor de la base de datos MySQL.
 * 
 * Intención: Validar que los parámetros de conexión son correctos y que la base de datos está disponible.
 * Parámetros: Ninguno.
 * Retorno: {Promise<boolean>} Retorna true si la conexión es exitosa, false en caso contrario.
 * Casos límite (edge cases):
 *   - Si el servidor de base de datos está apagado o inaccesible, captura el error y retorna false sin tumbar el servidor Express.
 *   - Si las credenciales de acceso son incorrectas, captura el error de credenciales inválidas y retorna false.
 */
async function probarConexion() {
  let conexion;

  try {
    conexion = await pool.getConnection();

    // Ejecuta una consulta simple para validar la conectividad real.
    await conexion.query('SELECT 1');

    registrador.info('Conexión a MySQL verificada correctamente.');
    return true;
  } catch (error) {
    registrador.error('Error al conectar con la base de datos MySQL.', {
      mensaje: error.message,
      codigo: error.code,
      errno: error.errno
    });

    return false;
  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}

module.exports = {
  pool,
  probarConexion
};