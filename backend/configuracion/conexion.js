const mysql = require('mysql2/promise');
const registrador = require('../utilidades/registrador.utilidad');
require('dotenv').config();

/**
 * Configuración del pool de conexiones para la base de datos MySQL.
 * Configurado utilizando variables de entorno y soporte para cifrado SSL.
 */
const configuracionPool = {
  host: process.env.BD_HOST,
  user: process.env.BD_USUARIO,
  password: process.env.BD_CONTRASENA,
  database: process.env.BD_NOMBRE,
  port: parseInt(process.env.BD_PUERTO || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.BD_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

/**
 * Pool de conexiones para la base de datos MySQL.
 * Se adapta automáticamente si se le pasa una URL completa de conexión (común en Render) o parámetros individuales.
 */
const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool(configuracionPool);

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
async function probarConexion(intentosMaximos = 5, retrasoMs = 2000) {
  let conexion;

  for (let intento = 1; intento <= intentosMaximos; intento++) {
    try {
      conexion = await pool.getConnection();

      // Ejecuta una consulta simple para validar la conectividad real.
      await conexion.query('SELECT 1');

      registrador.info('Conexión a MySQL verificada correctamente.');
      return true;
    } catch (error) {
      registrador.error(`Intento ${intento}/${intentosMaximos} fallido al conectar con la base de datos MySQL.`, {
        mensaje: error.message,
        codigo: error.code,
        errno: error.errno
      });

      if (intento < intentosMaximos) {
        registrador.info(`Reintentando conexión a base de datos en ${retrasoMs / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, retrasoMs));
      }
    } finally {
      if (conexion) {
        conexion.release();
      }
    }
  }

  return false;
}

module.exports = {
  pool,
  probarConexion
};