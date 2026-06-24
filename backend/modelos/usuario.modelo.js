const { pool } = require('../configuracion/conexion');

/**
 * Modelo: UsuarioModelo
 * Intención: Interactuar con las tablas Usuario y Cliente de la base de datos MySQL.
 */
class UsuarioModelo {
  /**
   * Intención: Buscar un usuario por su correo electrónico único.
   * Parámetros:
   *   - correo (string): Correo electrónico encriptado del usuario.
   * Retorno: Promise<Object|null> - Datos del usuario con sus campos si existe, de lo contrario null.
   */
  static async buscarPorCorreo(correo) {
    const query = `
      SELECT u.idUsuario AS id, u.correo, u.contrasena, u.rol, 
             c.idCliente, COALESCE(c.nombre, e.nombre) AS nombre, COALESCE(c.apellido, e.apellido) AS apellido, 
             c.telefono, c.direccion, e.puesto, e.idEmpleado
      FROM Usuario u
      LEFT JOIN Cliente c ON u.idUsuario = c.idUsuario
      LEFT JOIN Empleado e ON u.idUsuario = e.idUsuario
      WHERE u.correo = ?
    `;
    const [filas] = await pool.query(query, [correo]);
    return filas.length > 0 ? filas[0] : null;
  }

  /**
   * Intención: Buscar el correo y datos básicos de un cliente por su idCliente único.
   * Parámetros:
   *   - idCliente (number): ID único del cliente.
   * Retorno: Promise<Object|null> - Datos del cliente y su correo electrónico si existe, de lo contrario null.
   */
  static async buscarPorIdCliente(idCliente) {
    const query = `
      SELECT u.correo, c.nombre, c.apellido, c.telefono, c.direccion 
      FROM Cliente c
      JOIN Usuario u ON c.idUsuario = u.idUsuario
      WHERE c.idCliente = ?
    `;
    const [filas] = await pool.query(query, [idCliente]);
    return filas.length > 0 ? filas[0] : null;
  }

  /**
   * Intención: Insertar un nuevo registro de usuario y su cliente correspondiente en una transacción.
   * Parámetros:
   *   - nombre (string): Nombre del cliente.
   *   - apellido (string): Apellido del cliente.
   *   - correoCifrado (string): Correo encriptado del nuevo usuario.
   *   - contrasenaHash (string): Hash encriptado de la contraseña.
   *   - telefonoCifrado (string): Teléfono encriptado del cliente.
   *   - direccionCifrada (string): Dirección encriptada del cliente.
   * Retorno: Promise<Object> - El usuario recién creado con su idCliente asociado.
   */
  static async registrarClienteTransaccion(nombre, apellido, correoCifrado, contrasenaHash, telefonoCifrado, direccionCifrada = '') {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // Contar usuarios para determinar si es el primer registro del sistema
      const [conteo] = await conexion.query('SELECT COUNT(*) AS total FROM Usuario');
      const esPrimerUsuario = conteo[0].total === 0;
      const rolAsignado = esPrimerUsuario ? 'administrador' : 'cliente';

      // 1. Insertar el usuario
      const queryUsuario = 'INSERT INTO Usuario (correo, contrasena, rol) VALUES (?, ?, ?)';
      const [resultadoUsuario] = await conexion.query(queryUsuario, [correoCifrado, contrasenaHash, rolAsignado]);
      const idUsuario = resultadoUsuario.insertId;

      // 2. Insertar el cliente
      const queryCliente = 'INSERT INTO Cliente (nombre, apellido, telefono, direccion, idUsuario) VALUES (?, ?, ?, ?, ?)';
      const [resultadoCliente] = await conexion.query(queryCliente, [nombre, apellido, telefonoCifrado, direccionCifrada, idUsuario]);
      const idCliente = resultadoCliente.insertId;

      await conexion.commit();

      return {
        id: idUsuario,
        correo: correoCifrado,
        rol: rolAsignado,
        idCliente,
        nombre,
        apellido
      };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }
}

module.exports = UsuarioModelo;
