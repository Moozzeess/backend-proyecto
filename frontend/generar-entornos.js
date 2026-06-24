const fs = require('fs');
const path = require('path');

/**
 * Script: Generador de Entornos
 * Intención: Leer la configuración de un archivo .env o del entorno del sistema para crear los archivos environment.ts y environment.prod.ts en Angular.
 */
function generarEntornos() {
  const rutaEnv = path.join(__dirname, '.env');
  const variables = {};

  // Leer archivo .env si existe
  if (fs.existsSync(rutaEnv)) {
    const contenido = fs.readFileSync(rutaEnv, 'utf-8');
    const lineas = contenido.split(/\r?\n/);
    
    lineas.forEach(linea => {
      // Ignorar comentarios y líneas vacías
      if (linea.trim() && !linea.startsWith('#')) {
        const partes = linea.split('=');
        if (partes.length >= 2) {
          const clave = partes[0].trim();
          let valor = partes.slice(1).join('=').trim();
          // Eliminar comillas si las tiene
          if (valor.startsWith('"') && valor.endsWith('"')) {
            valor = valor.slice(1, -1);
          }
          if (valor.startsWith("'") && valor.endsWith("'")) {
            valor = valor.slice(1, -1);
          }
          variables[clave] = valor;
        }
      }
    });
  }

  // Dar prioridad a las variables de entorno del sistema (útil para Render)
  const urlBaseApi = process.env.URL_BASE_API || variables.URL_BASE_API || 'http://localhost:3000/api';
  const urlBaseApiProd = process.env.URL_BASE_API_PROD || variables.URL_BASE_API_PROD || urlBaseApi;

  // Crear directorio de entornos si no existe
  const dirEntornos = path.join(__dirname, 'src', 'environments');
  if (!fs.existsSync(dirEntornos)) {
    fs.mkdirSync(dirEntornos, { recursive: true });
  }

  // Contenido para el entorno de desarrollo
  const contenidoDesarrollo = `/**
 * Configuración de entorno para desarrollo.
 * Archivo autogenerado - no modificar directamente.
 * Modifique el archivo .env en la raíz del frontend.
 */
export const entorno = {
  produccion: false,
  urlBaseApi: '${urlBaseApi}'
};
`;

  // Contenido para el entorno de producción
  const contenidoProduccion = `/**
 * Configuración de entorno para producción.
 * Archivo autogenerado - no modificar directamente.
 * Modifique el archivo .env en la raíz del frontend o las variables del sistema en Render.
 */
export const entorno = {
  produccion: true,
  urlBaseApi: '${urlBaseApiProd}'
};
`;

  // Escribir los archivos
  fs.writeFileSync(path.join(dirEntornos, 'environment.ts'), contenidoDesarrollo, 'utf-8');
  fs.writeFileSync(path.join(dirEntornos, 'environment.prod.ts'), contenidoProduccion, 'utf-8');

  console.log(`[ENTORNO] Archivos generados correctamente.`);
  console.log(`[ENTORNO] Desarrollo: ${urlBaseApi}`);
  console.log(`[ENTORNO] Producción: ${urlBaseApiProd}`);
}

generarEntornos();
