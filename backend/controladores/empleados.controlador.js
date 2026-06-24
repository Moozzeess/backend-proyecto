const EmpleadosServicio = require('../servicios/empleados.servicio');
const registrador = require('../utilidades/registrador.utilidad');

/**
 * Controlador: EmpleadosControlador
 * Intención: Mediar las solicitudes HTTP relacionadas con la administración de empleados en el backend.
 */
class EmpleadosControlador {
  /**
   * Obtiene todos los empleados registrados.
   */
  static async obtenerTodos(req, res, next) {
    try {
      const empleados = await EmpleadosServicio.listarTodos();
      res.json({
        exito: true,
        datos: empleados
      });
    } catch (error) {
      registrador.error('Error en EmpleadosControlador.obtenerTodos', { mensaje: error.message });
      next(error);
    }
  }

  /**
   * Registra un nuevo empleado.
   */
  static async registrar(req, res, next) {
    try {
      const nuevoEmpleado = await EmpleadosServicio.registrar(req.body);
      res.status(201).json({
        exito: true,
        datos: nuevoEmpleado
      });
    } catch (error) {
      registrador.error('Error en EmpleadosControlador.registrar', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Actualiza un empleado existente.
   */
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const exito = await EmpleadosServicio.actualizarEmpleado(parseInt(id, 10), req.body);
      res.json({
        exito,
        mensaje: exito ? 'Empleado actualizado correctamente.' : 'No se pudo realizar la actualización.'
      });
    } catch (error) {
      registrador.error('Error en EmpleadosControlador.actualizar', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }

  /**
   * Conmuta el estado del empleado entre Activo e Inactivo.
   */
  static async conmutarEstatus(req, res, next) {
    try {
      const { id } = req.params;
      const nuevoEstado = await EmpleadosServicio.conmutarEstatus(parseInt(id, 10));
      res.json({
        exito: true,
        datos: { estado: nuevoEstado }
      });
    } catch (error) {
      registrador.error('Error en EmpleadosControlador.conmutarEstatus', { mensaje: error.message });
      res.status(400).json({
        exito: false,
        mensaje: error.message
      });
    }
  }
}

module.exports = EmpleadosControlador;
