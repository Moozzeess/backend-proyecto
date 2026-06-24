const { pool } = require('../configuracion/conexion');
const { encriptarCorreo, desencriptarCorreo } = require('../utilidades/encriptacion.utilidad');
const bcrypt = require('bcryptjs');

/**
 * Modelo: EmpleadoModelo
 * Intención: Proporcionar métodos de acceso y manipulación de datos en la tabla Empleado de MySQL.
 */
class EmpleadoModelo {
  /**
   * Obtiene la lista completa de empleados con su respectiva sucursal asignada.
   * Intención: Listar los datos del personal para el panel del administrador.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array<Object>>} Lista de empleados.
   */
  static async obtenerTodos() {
    const query = `
      SELECT e.idEmpleado AS id, CONCAT(e.nombre, ' ', e.apellido) AS nombre,
             e.puesto, s.nombre AS sucursal, e.salario, e.estado, u.correo
      FROM Empleado e
      JOIN Sucursal s ON e.idSucursal = s.idSucursal
      LEFT JOIN Usuario u ON e.idUsuario = u.idUsuario
      ORDER BY e.idEmpleado ASC
    `;
    const [filas] = await pool.query(query);
    return filas.map(f => ({
      ...f,
      correo: f.correo ? desencriptarCorreo(f.correo) : ''
    }));
  }

  /**
   * Registra un nuevo empleado en la base de datos MySQL creando sus credenciales de acceso asociadas en Usuario.
   * Intención: Registrar al empleado de manera segura en transacciones SQL.
   */
  static async crear(nombre, puesto, sucursalNombre, salario, correo, contrasena, estado = 'Activo') {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // 1. Obtener idSucursal
      const querySucursal = 'SELECT idSucursal FROM Sucursal WHERE nombre = ? LIMIT 1';
      const [sucursales] = await conexion.query(querySucursal, [sucursalNombre]);
      const idSucursal = sucursales.length > 0 ? sucursales[0].idSucursal : 1;

      // 2. Insertar Usuario (credenciales)
      let idUsuario = null;
      if (correo && contrasena) {
        const correoCifrado = encriptarCorreo(correo);
        const sal = bcrypt.genSaltSync(10);
        const contrasenaHash = bcrypt.hashSync(contrasena, sal);
        
        const queryUsuario = 'INSERT INTO Usuario (correo, contrasena, rol) VALUES (?, ?, \'empleado\')';
        const [resUsuario] = await conexion.query(queryUsuario, [correoCifrado, contrasenaHash]);
        idUsuario = resUsuario.insertId;
      }

      // 3. Insertar Empleado
      const partes = nombre.trim().split(' ');
      const nombrePila = partes[0];
      const apellido = partes.slice(1).join(' ') || ' ';

      const queryEmpleado = `
        INSERT INTO Empleado (nombre, apellido, puesto, salario, idSucursal, idUsuario, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [resEmpleado] = await conexion.query(queryEmpleado, [nombrePila, apellido, puesto, salario, idSucursal, idUsuario, estado]);
      
      await conexion.commit();
      return resEmpleado.insertId;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  /**
   * Modifica la información de un empleado existente y sus credenciales de usuario.
   */
  static async actualizar(id, nombre, puesto, sucursalNombre, salario, correo, contrasena, estado) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();

      // 1. Buscar idUsuario del empleado
      const [empData] = await conexion.query('SELECT idUsuario FROM Empleado WHERE idEmpleado = ?', [id]);
      if (empData.length === 0) throw new Error('Empleado no encontrado.');
      let idUsuario = empData[0].idUsuario;

      // 2. Si no tiene usuario y se provee correo, crearlo. Si tiene, actualizar correo/contraseña
      if (correo) {
        const correoCifrado = encriptarCorreo(correo);
        if (!idUsuario) {
          const sal = bcrypt.genSaltSync(10);
          const contrasenaHash = bcrypt.hashSync(contrasena || 'Pizza12345', sal);
          const queryUserInsert = 'INSERT INTO Usuario (correo, contrasena, rol) VALUES (?, ?, \'empleado\')';
          const [resUser] = await conexion.query(queryUserInsert, [correoCifrado, contrasenaHash]);
          idUsuario = resUser.insertId;
        } else {
          if (contrasena) {
            const sal = bcrypt.genSaltSync(10);
            const contrasenaHash = bcrypt.hashSync(contrasena, sal);
            await conexion.query('UPDATE Usuario SET correo = ?, contrasena = ? WHERE idUsuario = ?', [correoCifrado, contrasenaHash, idUsuario]);
          } else {
            await conexion.query('UPDATE Usuario SET correo = ? WHERE idUsuario = ?', [correoCifrado, idUsuario]);
          }
        }
      }

      // 3. Actualizar Empleado
      const querySucursal = 'SELECT idSucursal FROM Sucursal WHERE nombre = ? LIMIT 1';
      const [sucursales] = await conexion.query(querySucursal, [sucursalNombre]);
      const idSucursal = sucursales.length > 0 ? sucursales[0].idSucursal : 1;

      const partes = nombre.trim().split(' ');
      const nombrePila = partes[0];
      const apellido = partes.slice(1).join(' ') || ' ';

      const queryEmpleado = `
        UPDATE Empleado
        SET nombre = ?, apellido = ?, puesto = ?, salario = ?, idSucursal = ?, idUsuario = ?, estado = ?
        WHERE idEmpleado = ?
      `;
      await conexion.query(queryEmpleado, [nombrePila, apellido, puesto, salario, idSucursal, idUsuario, estado, id]);

      await conexion.commit();
      return true;
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  /**
   * Conmuta o cambia el estado (Activo/Inactivo) de un empleado.
   */
  static async conmutarEstado(id) {
    const queryBuscar = 'SELECT estado, idUsuario FROM Empleado WHERE idEmpleado = ?';
    const [empleados] = await pool.query(queryBuscar, [id]);
    if (empleados.length === 0) {
      throw new Error('Empleado no encontrado.');
    }

    const estadoActual = empleados[0].estado;
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    const queryUpdate = 'UPDATE Empleado SET estado = ? WHERE idEmpleado = ?';
    await pool.query(queryUpdate, [nuevoEstado, id]);
    return nuevoEstado;
  }
}

module.exports = EmpleadoModelo;
