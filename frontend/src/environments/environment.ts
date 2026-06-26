/**
 * Configuración del entorno de la aplicación.
 * 
 * Intención: Centralizar las variables de configuración y URLs de los servicios del backend.
 * Propiedades:
 *   - produccion: {boolean} Indica si el entorno corresponde a una compilación de producción.
 *   - urlBaseApi: {string} La URL base del servidor backend para consumo de servicios.
 */
declare const process: any;

export const entorno = {
  produccion: process.env.NODE_ENV === 'production',
  urlBaseApi: process.env.NG_APP_URL_BASE_API || ''
};
