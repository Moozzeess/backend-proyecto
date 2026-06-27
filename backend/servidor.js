const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { probarConexion } = require('./configuracion/conexion');
const { inicializarTablas } = require('./configuracion/inicializarTablas');
const registrador = require('./utilidades/registrador.utilidad');
const registrarSolicitud = require('./middlewares/solicitudes.middleware');
const limitadorSolicitudes = require('./middlewares/limitador.middleware');
const manejadorErroresGlobal = require('./middlewares/error.middleware');
const CorreoServicio = require('./servicios/correo.servicio');
const swaggerUi = require('swagger-ui-express');
const especificacionSwagger = require('./configuracion/swagger');

const app = express();
const PUERTO = process.env.PUERTO || 3000;

// Aplicar middlewares de seguridad y análisis del cuerpo de la petición
app.use(helmet({
  contentSecurityPolicy: false
}));
// Configuración de CORS dinámica y segura para producción (Render) y desarrollo
const origenPermitido = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: origenPermitido === '*' ? '*' : origenPermitido.split(','),
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(registrarSolicitud);
app.use(limitadorSolicitudes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(especificacionSwagger));

// Rutas de la API global
const rutasDeLaApi = require('./rutas/indice.rutas');
app.use('/api', rutasDeLaApi);

/**
 * Endpoint de estado para comprobar la salud del servidor y la base de datos.
 * 
 * Intención: Monitorear que el servidor esté activo y la base de datos responda adecuadamente.
 * Parámetros:
 *   - peticion: {Object} Objeto de solicitud HTTP (Request).
 *   - respuesta: {Object} Objeto de respuesta HTTP (Response).
 * Retorno: Envía una respuesta JSON con el estado de los servicios.
 * Casos límite (edge cases):
 *   - Si la base de datos no está disponible, el servidor Express no se cae pero reporta el estado de la base de datos como DESCONECTADO.
 */
app.get('/api/estado', async (peticion, respuesta) => {
  const baseDatosActiva = await probarConexion();
  
  respuesta.json({
    exito: true,
    mensaje: 'Servidor en funcionamiento correctamente.',
    servicios: {
      servidor: 'ACTIVO',
      baseDatos: baseDatosActiva ? 'CONECTADO' : 'DESCONECTADO'
    },
    marcaTiempo: new Date().toISOString()
  });
});

// Registrar el middleware de errores global (Debe ser el último middleware)
app.use(manejadorErroresGlobal);

// Iniciar el servidor
app.listen(PUERTO, async () => {
  registrador.info(`Servidor backend corriendo exitosamente en el puerto ${PUERTO}`);
  
  // Validar conexión inicial a la base de datos y crear tablas automáticamente si no existen
  const baseDatosConectada = await probarConexion();
  if (baseDatosConectada) {
    registrador.info('Conexión inicial a la base de datos MySQL establecida correctamente.');
    try {
      await inicializarTablas();
    } catch (error) {
      registrador.error('No se pudieron inicializar las tablas de la base de datos en el arranque.', { error: error.message });
    }
  } else {
    registrador.error('No se pudo establecer la conexión inicial a la base de datos MySQL. Verifique las credenciales y el estado del servicio.');
  }

  // Validar conexión inicial del correo emisor de forma estricta
  try {
    await CorreoServicio.verificarConexion();
  } catch (error) {
    registrador.error('[pizza pizza backend] El servicio de correo SMTP no está disponible o las credenciales son incorrectas.', { error: error.message });
  }
});

module.exports = app;
