import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from './autenticacion.service';

/**
 * Interceptor de Autenticación HTTP.
 * Intención: Adjuntar el token JWT de sesión a todas las peticiones HTTP dirigidas al backend si el usuario está autenticado.
 * Parámetros:
 *   - peticion: Solicitud HTTP saliente.
 *   - siguiente: Siguiente manejador en la cadena de interceptores.
 * Retorno: Flujo de eventos HTTP de la petición procesada.
 * Casos límite:
 *   - Si el usuario no ha iniciado sesión o no posee un token, la solicitud se envía sin modificaciones.
 */
export const interceptorAutenticacion: HttpInterceptorFn = (peticion, siguiente) => {
  const servicioAutenticacion = inject(AutenticacionService);
  const usuarioActivo = servicioAutenticacion.usuarioActual();

  if (usuarioActivo && usuarioActivo.token) {
    const peticionClonada = peticion.clone({
      setHeaders: {
        Authorization: `Bearer ${usuarioActivo.token}`
      }
    });
    return siguiente(peticionClonada);
  }

  return siguiente(peticion);
};
