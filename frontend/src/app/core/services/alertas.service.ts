import { Injectable } from '@angular/core';

/**
 * Interfaz que representa la estructura estandarizada de un error o alerta en el sistema.
 * Conforme a la Regla 8, incluye descripciones técnicas y explicaciones amigables.
 */
export interface AlertaError {
  /** Código único identificador de la alerta o error. */
  codigo: string;
  /** Detalles a nivel técnico de lo que falló. */
  descripcionTecnica: string;
  /** Explicación clara orientada al desarrollador para depuración. */
  explicacionDesarrollador: string;
  /** Explicación no técnica orientada al usuario final. */
  mensajeUsuario: string;
}

/**
 * Servicio: AlertasService
 * Intención: Centralizar en un único punto todas las alertas, errores y notificaciones de la aplicación.
 * Cumple con la directriz del proyecto de usar un único archivo para manejar alertas y errores.
 */
@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  /** Catálogo de alertas y errores predefinidos en el sistema. */
  private readonly catalogoErrores: Record<string, AlertaError> = {
    'CAMPOS_VACIOS': {
      codigo: 'CAMPOS_VACIOS',
      descripcionTecnica: 'ValidationError: One or more required form fields are empty or null.',
      explicacionDesarrollador: 'El formulario enviado contiene valores vacíos o nulos en campos marcados como obligatorios.',
      mensajeUsuario: 'Por favor, completa todos los campos del formulario.'
    },
    'CORREO_INVALIDO': {
      codigo: 'CORREO_INVALIDO',
      descripcionTecnica: 'FormatError: Email input does not match the RFC 5322 standard regex.',
      explicacionDesarrollador: 'El formato de correo proporcionado no superó la prueba regex estándar de emails.',
      mensajeUsuario: 'Por favor, introduce un correo electrónico con formato válido (ejemplo@dominio.com).'
    },
    'CONTRASENIA_DEBIL': {
      codigo: 'CONTRASENIA_DEBIL',
      descripcionTecnica: 'PasswordStrengthError: Security requirements (min 8 chars, 1 upper, 1 lower, 1 number, 1 special char) not met.',
      explicacionDesarrollador: 'La contraseña ingresada no cumple con la complejidad requerida por las políticas de seguridad del sistema.',
      mensajeUsuario: 'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial. La longitud debe ser de al menos 8 caracteres.'
    },
    'CONTRASENIAS_DIFERENTES': {
      codigo: 'CONTRASENIAS_DIFERENTES',
      descripcionTecnica: 'MatchError: Password fields mismatch.',
      explicacionDesarrollador: 'Los campos de contraseña y confirmación de contraseña no coinciden en el formulario de registro.',
      mensajeUsuario: 'Las contraseñas no coinciden. Por favor, verifícalas.'
    },
    'CARRITO_VACIO': {
      codigo: 'CARRITO_VACIO',
      descripcionTecnica: 'CartEmptyError: Attempted operation on an empty shopping cart list.',
      explicacionDesarrollador: 'Se intentó iniciar la orden de compra pero la longitud de la lista del carrito es cero.',
      mensajeUsuario: 'Tu carrito de compras está vacío. Agrega algunos productos antes de procesar el pago.'
    },
    'CREDENCIALES_INCORRECTAS': {
      codigo: 'CREDENCIALES_INCORRECTAS',
      descripcionTecnica: 'AuthError: Email or password does not match any registered users.',
      explicacionDesarrollador: 'Las credenciales proporcionadas no corresponden a ningún usuario en el sistema.',
      mensajeUsuario: 'Correo electrónico o contraseña incorrectos.'
    },
    'CORREO_DUPLICADO': {
      codigo: 'CORREO_DUPLICADO',
      descripcionTecnica: 'ConflictError: The email provided is already registered in the system.',
      explicacionDesarrollador: 'Intento de registro con un correo existente en la base de datos de usuarios.',
      mensajeUsuario: 'El correo electrónico ya se encuentra registrado.'
    },
    'TARJETA_INVALIDA': {
      codigo: 'TARJETA_INVALIDA',
      descripcionTecnica: 'PaymentValidationError: Card details (16 digit number, expiry MM/YY, 3-digit CVV) failed basic validations.',
      explicacionDesarrollador: 'El usuario ingresó datos incompletos o erróneos del método de pago con tarjeta.',
      mensajeUsuario: 'Los datos de la tarjeta son inválidos. Por favor, revisa el número, la fecha de expiración y el CVV.'
    },
    'DIRECCION_FALTANTE': {
      codigo: 'DIRECCION_FALTANTE',
      descripcionTecnica: 'DeliveryValidationError: Street, zip code or contact phone missing for home delivery option.',
      explicacionDesarrollador: 'Se seleccionó entrega a domicilio pero faltan datos esenciales para completar el envío.',
      mensajeUsuario: 'Por favor, proporciona una dirección de entrega completa y un número telefónico de contacto.'
    }
  };

  /**
   * Obtiene la estructura completa de un error/alerta por su código identificador.
   * Intención: Recuperar detalles de errores bajo el estándar de la Regla 8.
   * Parámetros:
   *   - codigo (string): Código de error registrado en el catálogo.
   * Retorno: AlertaError - Objeto con descripciones y mensajes.
   */
  obtenerError(codigo: string): AlertaError {
    return this.catalogoErrores[codigo] || {
      codigo: 'ERROR_DESCONOCIDO',
      descripcionTecnica: 'UnknownError: An unhandled or unexpected error occurred.',
      explicacionDesarrollador: `Error no catalogado solicitado con el código: ${codigo}`,
      mensajeUsuario: 'Ocurrió un problema inesperado. Por favor, inténtalo de nuevo.'
    };
  }

  /**
   * Genera dinámicamente un objeto de alerta o error personalizado que cumpla con la interfaz requerida.
   * Intención: Permitir crear errores particulares que no estén en el catálogo base.
   * Parámetros:
   *   - codigo (string): Código único para el error.
   *   - descTecnica (string): Detalles del error.
   *   - explDev (string): Guía para el desarrollador.
   *   - msgUsuario (string): Mensaje no técnico para el cliente.
   * Retorno: AlertaError - Objeto estructurado.
   */
  crearErrorPersonalizado(
    codigo: string,
    descTecnica: string,
    explDev: string,
    msgUsuario: string
  ): AlertaError {
    return {
      codigo,
      descripcionTecnica: descTecnica,
      explicacionDesarrollador: explDev,
      mensajeUsuario: msgUsuario
    };
  }
}
