const registrador = require('../utilidades/registrador.utilidad');

// Mapa en memoria para almacenar las marcas de tiempo de las solicitudes por dirección IP
const historialSolicitudes = new Map();

// Ventana de tiempo en milisegundos (1 minuto)
const VENTANA_TIEMPO_MS = 60000;
// Límite máximo de peticiones por ventana de tiempo por IP
const LIMITE_PETICIONES = 50;

/**
 * Middleware: limitadorSolicitudes
 * Intención: Proteger el servidor contra ataques de denegación de servicio (DoS) y fuerza bruta controlando la tasa de peticiones por dirección IP en memoria.
 * Parámetros:
 *   - peticion: Objeto de solicitud de Express (Request).
 *   - respuesta: Objeto de respuesta de Express (Response).
 *   - siguiente: Función callback para continuar con el siguiente middleware.
 * Retorno: Envía un error HTTP 429 si se supera el límite de peticiones, o transfiere el flujo si es válido.
 * Casos límite (edge cases):
 *   - Si la IP no puede determinarse, se utiliza un fallback genérico.
 *   - Limpia periódicamente el historial de marcas de tiempo viejas para evitar fugas de memoria.
 */
function limitadorSolicitudes(peticion, respuesta, siguiente) {
  const ip = peticion.ip || peticion.headers['x-forwarded-for'] || peticion.socket.remoteAddress || '127.0.0.1';
  const ahora = Date.now();

  if (!historialSolicitudes.has(ip)) {
    historialSolicitudes.set(ip, []);
  }

  const tiemposPeticiones = historialSolicitudes.get(ip);

  // Filtrar peticiones que ya expiraron fuera de la ventana de tiempo
  const peticionesActivas = tiemposPeticiones.filter(tiempo => ahora - tiempo < VENTANA_TIEMPO_MS);

  // Agregar la petición actual
  peticionesActivas.push(ahora);
  historialSolicitudes.set(ip, peticionesActivas);

  // Validar si supera el límite de peticiones permitido
  if (peticionesActivas.length > LIMITE_PETICIONES) {
    registrador.warn(`Límite de peticiones excedido para la dirección IP: ${ip}. Solicitudes en el último minuto: ${peticionesActivas.length}`);

    return respuesta.status(429).json({
      exito: false,
      codigo: 'TOO_MANY_REQUESTS',
      mensaje: 'Has realizado demasiadas solicitudes al servidor en poco tiempo. Por favor, espera un minuto e intenta de nuevo.'
    });
  }

  siguiente();
}

// Limpieza automática preventiva cada 5 minutos para liberar memoria de IPs inactivas
setInterval(() => {
  const ahora = Date.now();
  for (const [ip, tiempos] of historialSolicitudes.entries()) {
    const validos = tiempos.filter(tiempo => ahora - tiempo < VENTANA_TIEMPO_MS);
    if (validos.length === 0) {
      historialSolicitudes.delete(ip);
    } else {
      historialSolicitudes.set(ip, validos);
    }
  }
}, 300000);

module.exports = limitadorSolicitudes;
