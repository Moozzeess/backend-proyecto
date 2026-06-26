const jwt = require('jsonwebtoken');
const registrador = require('../utilidades/registrador.utilidad');
require('dotenv').config();

const SECRETO = process.env.JWT_SECRETO || 'clave_secreta_super_segura_para_el_proyecto_pizza_pizza';

/**
 * Middleware para verificar la validez del token JWT adjunto en la petición.
 * 
 * Intención: Autenticar al usuario extrayendo el token e inyectando su información en el objeto peticion.
 * Parámetros:
 *   - peticion: {Object} Solicitud de Express (Request).
 *   - respuesta: {Object} Respuesta de Express (Response).
 *   - siguiente: {Function} Callback para continuar al siguiente middleware (NextFunction).
 * Retorno: Envía una respuesta HTTP 401 si el token no está presente o es inválido.
 * Casos límite (edge cases):
 *   - Si el encabezado de autorización no inicia con 'Bearer ', se deniega el acceso.
 *   - Si el token expira durante la sesión del usuario, se captura la excepción y retorna un error claro.
 */
function verificarToken(peticion, respuesta, siguiente) {
  const encabezadoAutorizacion = peticion.headers['authorization'];
  
  if (!encabezadoAutorizacion) {
    return respuesta.status(401).json({
      exito: false,
      codigo: 401,
      error: {
        explicacionUsuario: 'Su sesión ha expirado o no ha iniciado sesión. Por favor, ingrese sus credenciales.',
        explicacionDesarrollador: 'Falta la cabecera Authorization en la solicitud HTTP.',
        descripcionTecnica: 'Header Authorization no provisto.'
      }
    });
  }

  const partes = encabezadoAutorizacion.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return respuesta.status(401).json({
      exito: false,
      codigo: 401,
      error: {
        explicacionUsuario: 'La sesión no es válida. Por favor, vuelva a ingresar.',
        explicacionDesarrollador: 'El token no sigue el formato estándar "Bearer <token>".',
        descripcionTecnica: 'Formato de token inválido en cabecera.'
      }
    });
  }

  const token = partes[1];

  try {
    const decodificado = jwt.verify(token, SECRETO);
    // Inyectar la información del usuario decodificado en la petición
    peticion.usuario = {
      idUsuario: decodificado.idUsuario,
      correo: decodificado.correo,
      rol: decodificado.rol,
      idCliente: decodificado.idCliente
    };
    siguiente();
  } catch (error) {
    registrador.warn('Intento de acceso con token inválido.', error.message);
    
    return respuesta.status(401).json({
      exito: false,
      codigo: 401,
      error: {
        explicacionUsuario: 'Sesión no válida o expirada. Por favor, inicie sesión nuevamente.',
        explicacionDesarrollador: 'Fallo al verificar la firma o vigencia del JWT.',
        descripcionTecnica: error.message
      }
    });
  }
}

/**
 * Middleware para autorizar el acceso basándose en la lista de roles permitidos.
 * 
 * Intención: Restringir rutas específicas a usuarios que no posean el perfil requerido (ej. impedir que clientes accedan a admin).
 * Parámetros:
 *   - rolesPermitidos: {Array<string>} Listado de roles que tienen acceso a la ruta.
 * Retorno: {Function} Retorna un middleware de Express.
 * Casos límite (edge cases):
 *   - Si el rol del usuario no está dentro del arreglo, deniega el acceso con 403.
 *   - Si se invoca sin roles permitidos definidos, bloquea el acceso por defecto por seguridad.
 */
function permitirRoles(...rolesPermitidos) {
  return (peticion, respuesta, siguiente) => {
    if (!peticion.usuario) {
      return respuesta.status(401).json({
        exito: false,
        codigo: 401,
        error: {
          explicacionUsuario: 'Debe iniciar sesión para realizar esta acción.',
          explicacionDesarrollador: 'Se intentó validar roles sin haber ejecutado verificarToken previamente.',
          descripcionTecnica: 'peticion.usuario no está definido.'
        }
      });
    }

    if (rolesPermitidos.length === 0 || !rolesPermitidos.includes(peticion.usuario.rol)) {
      return respuesta.status(403).json({
        exito: false,
        codigo: 403,
        error: {
          explicacionUsuario: 'No tiene los permisos necesarios para acceder a esta información.',
          explicacionDesarrollador: `Acceso denegado para el rol: ${peticion.usuario.rol}. Roles permitidos: ${rolesPermitidos.join(', ')}`,
          descripcionTecnica: 'Rol no autorizado para consumir el endpoint.'
        }
      });
    }

    siguiente();
  };
}

/**
 * Middleware para asegurar que un cliente solo acceda a su propia información (aislamiento de datos).
 * 
 * Intención: Evitar que un cliente acceda a los datos de otros clientes (ej. Cliente J intentando ver cliente K).
 * Parámetros:
 *   - nombreParametroId: {string} El nombre del parámetro de ruta que contiene el ID a comparar (ej. 'idUsuario').
 * Retorno: {Function} Retorna un middleware de Express.
 * Casos límite (edge cases):
 *   - Un usuario con rol 'administrador' puede omitir esta validación para gestionar o auditar cualquier usuario.
 *   - Si el parámetro de ruta no está presente o no coincide con el token, restringe el acceso con 403.
 */
function verificarPropietarioOAdmin(nombreParametroId = 'idUsuario') {
  return (peticion, respuesta, siguiente) => {
    if (!peticion.usuario) {
      return respuesta.status(401).json({
        exito: false,
        codigo: 401,
        error: {
          explicacionUsuario: 'Debe iniciar sesión para realizar esta acción.',
          explicacionDesarrollador: 'Se intentó verificar propietario sin ejecutar verificarToken previamente.',
          descripcionTecnica: 'peticion.usuario no está definido.'
        }
      });
    }

    const idRecurso = peticion.params[nombreParametroId];

    // Los administradores tienen acceso irrestricto
    if (peticion.usuario.rol === 'administrador') {
      return siguiente();
    }

    // Determinar qué ID comparar basándose en el parámetro de la ruta solicitado
    const idComparar = nombreParametroId === 'idCliente'
      ? peticion.usuario.idCliente
      : peticion.usuario.idUsuario;

    // Comparar ID correspondiente del token con el ID del recurso de la URL
    if (String(idComparar) !== String(idRecurso)) {
      return respuesta.status(403).json({
        exito: false,
        codigo: 403,
        error: {
          explicacionUsuario: 'No está autorizado para ver o modificar la información de otra cuenta.',
          explicacionDesarrollador: `Acceso restringido. idComparar (${idComparar}) no coincide con id del recurso (${idRecurso}).`,
          descripcionTecnica: 'Aislamiento de recursos violado (Insecure Direct Object Reference prevenido).'
        }
      });
    }

    siguiente();
  };
}

module.exports = {
  verificarToken,
  permitirRoles,
  verificarPropietarioOAdmin
};
