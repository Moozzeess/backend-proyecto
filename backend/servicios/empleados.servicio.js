const EmpleadoModelo = require('../modelos/empleado.modelo');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Servicio: EmpleadosServicio
 * Intención: Alojar la lógica de negocio para la gestión del personal, aplicando reglas de validación y logs de auditoría.
 */
class EmpleadosServicio {
  /**
   * Obtiene la lista completa de empleados.
   * Intención: Retornar los trabajadores de la base de datos real.
   * Parámetros: Ninguno.
   * Retorno: {Promise<Array>} Lista de empleados.
   */
  static async listarTodos() {
    return await EmpleadoModelo.obtenerTodos();
  }

  /**
   * Registra un nuevo empleado en la base de datos y escribe un log de auditoría.
   * Intención: Agregar personal de forma controlada y segura.
   */
  static async registrar(datos) {
    const { nombre, puesto, sucursal, salario, correo, contrasena, estado } = datos;
    
    // Validación básica de entrada
    if (!nombre || !puesto || !salario || salario <= 0) {
      throw new Error('Datos del empleado incompletos o salario inválido.');
    }

    const idEmpleado = await EmpleadoModelo.crear(nombre, puesto, sucursal, salario, correo, contrasena, estado);

    // Registro de auditoría
    registrador.info(`AUDITORÍA: El administrador registró un nuevo empleado y su usuario de acceso. ID: ${idEmpleado}, Nombre: ${nombre}, Correo: ${correo}`);

    return { id: idEmpleado, nombre, puesto, sucursal, salario, correo, estado };
  }

  /**
   * Modifica los datos de un empleado y escribe un log de auditoría.
   */
  static async actualizarEmpleado(id, datos) {
    const { nombre, puesto, sucursal, salario, correo, contrasena, estado } = datos;

    if (!id || !nombre || !puesto || !salario || salario <= 0) {
      throw new Error('Faltan parámetros esenciales para actualizar al empleado.');
    }

    const exito = await EmpleadoModelo.actualizar(id, nombre, puesto, sucursal, salario, correo, contrasena, estado);

    if (exito) {
      registrador.info(`AUDITORÍA: El administrador actualizó los datos y credenciales del empleado ID: ${id}. Correo: ${correo}`);
    }

    return exito;
  }

  /**
   * Conmuta el estado de un empleado (Activo/Inactivo) y audita el evento.
   * Intención: Habilitar o suspender temporalmente a un empleado.
   * Parámetros:
   *   - id (number): ID del empleado.
   * Retorno: {Promise<string>} El nuevo estado.
   */
  static async conmutarEstatus(id) {
    if (!id) {
      throw new Error('ID de empleado requerido.');
    }

    const nuevoEstado = await EmpleadoModelo.conmutarEstado(id);
    registrador.warn(`AUDITORÍA: El administrador modificó el estado del empleado ID: ${id} a ${nuevoEstado}`);
    return nuevoEstado;
  }
}

module.exports = EmpleadosServicio;
