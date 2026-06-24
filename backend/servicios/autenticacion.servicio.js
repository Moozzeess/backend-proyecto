const bcrypt = require('bcryptjs');
const UsuarioModelo = require('../modelos/usuario.modelo');
const CorreoServicio = require('./correo.servicio');
const { 
  encriptarCorreo, 
  encriptarTexto, 
  desencriptarCorreo, 
  desencriptarTexto 
} = require('../utilidades/encriptacion.utilidad');

/**
 * Servicio: AutenticacionServicio
 * Intención: Gestionar las validaciones de negocio de inicio de sesión y registro utilizando contraseñas seguras y encriptación de datos sensibles.
 */
class AutenticacionServicio {
  /**
   * Intención: Validar credenciales de inicio de sesión.
   * Parámetros:
   *   - correo (string): Correo del usuario en texto plano.
   *   - contrasena (string): Contraseña provista en texto plano.
   * Retorno: Promise<Object|null> - Objeto de usuario descifrado si es correcto, null si no coincide.
   */
  static async iniciarSesion(correo, contrasena) {
    // Encriptar correo de manera determinista para realizar la búsqueda exacta en base de datos
    const correoCifrado = encriptarCorreo(correo);
    const usuario = await UsuarioModelo.buscarPorCorreo(correoCifrado);
    
    if (!usuario) {
      return null;
    }

    // Comparar la contraseña ingresada con el hash guardado en base de datos
    const coinciden = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!coinciden) {
      return null;
    }

    // Quitar la contraseña de los datos devueltos
    delete usuario.contrasena;

    // Desencriptar datos personales antes de enviarlos al frontend
    usuario.correo = desencriptarCorreo(usuario.correo);
    if (usuario.telefono) {
      usuario.telefono = desencriptarTexto(usuario.telefono);
    }
    if (usuario.direccion) {
      usuario.direccion = desencriptarTexto(usuario.direccion);
    }

    return usuario;
  }

  /**
   * Intención: Registrar un nuevo cliente.
   * Parámetros:
   *   - nombre (string): Nombre.
   *   - apellido (string): Apellido.
   *   - correo (string): Correo electrónico en texto plano.
   *   - contrasena (string): Contraseña en texto plano.
   *   - telefono (string): Teléfono en texto plano.
   *   - direccion (string, opcional): Dirección en texto plano.
   * Retorno: Promise<Object> - Usuario y cliente creados con datos descifrados.
   */
  static async registrar(nombre, apellido, correo, contrasena, telefono, direccion = '') {
    // Validar si el correo ya existe buscando su equivalente cifrado
    const correoCifrado = encriptarCorreo(correo);
    const usuarioExistente = await UsuarioModelo.buscarPorCorreo(correoCifrado);
    
    if (usuarioExistente) {
      const error = new Error('El correo electrónico ya se encuentra registrado.');
      error.status = 409;
      throw error;
    }

    // Hashear la contraseña
    const sal = bcrypt.genSaltSync(10);
    const contrasenaHash = bcrypt.hashSync(contrasena, sal);

    // Cifrar el resto de los datos sensibles (teléfono y dirección)
    const telefonoCifrado = encriptarTexto(telefono);
    const direccionCifrada = encriptarTexto(direccion);

    const resultado = await UsuarioModelo.registrarClienteTransaccion(
      nombre,
      apellido,
      correoCifrado,
      contrasenaHash,
      telefonoCifrado,
      direccionCifrada
    );

    // Enviar correo de bienvenida de forma asíncrona en segundo plano
    CorreoServicio.enviarCorreoBienvenida(correo, `${nombre} ${apellido}`.trim());

    // Desencriptar el correo antes de retornarlo
    resultado.correo = desencriptarCorreo(resultado.correo);
    return resultado;
  }
}

module.exports = AutenticacionServicio;
