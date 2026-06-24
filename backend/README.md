# Pizza Pizza - Backend de la Aplicación

Este directorio contiene el backend de la aplicación, desarrollado en Node.js, Express y MySQL. La arquitectura del sistema está diseñada bajo los principios de Arquitectura Limpia (Clean Architecture), promoviendo el desacoplamiento de responsabilidades y la mantenibilidad a largo plazo.

---

## Arquitectura del Backend

El backend se estructura en capas bien definidas. El flujo de control se desplaza desde el exterior (la petición HTTP del cliente) hacia el interior (las consultas a la base de datos), donde cada capa tiene una única responsabilidad:

```text
       [ Cliente / Frontend ]
                 │
                 ▼ (Petición HTTP)
        [ Capa de Enrutamiento ] (rutas/)
                 │
                 ▼ (Seguridad / Validación)
       [ Capa de Middlewares ] (middlewares/)
                 │
                 ▼ (Controlador de Entrada)
       [ Capa de Presentación ] (controladores/)
                 │
                 ▼ (Reglas de Negocio)
         [ Capa de Servicios ] (servicios/)
                 │
                 ▼ (Acceso a Datos)
         [ Capa de Acceso / Persistencia ] (modelos/)
                 │
                 ▼ (Consulta SQL)
       [ Base de Datos MySQL ]
```

---

## Descripción Detallada de las Capas

### 1. Capa de Enrutamiento (`rutas/`)
* **Propósito:** Define los endpoints de la API y los mapea hacia sus respectivos controladores.
* **Responsabilidades:**
  * Determinar las rutas públicas y privadas.
  * Interectar middlewares específicos (como autenticación o control de roles) para cada ruta.

### 2. Capa de Middlewares (`middlewares/`)
* **Propósito:** Filtros intermedios que procesan las peticiones antes de que alcancen los controladores.
* **Responsabilidades:**
  * Validación y verificación de firmas de tokens JWT.
  * Sanitización de entradas del usuario.
  * Registro de accesos y auditoría de peticiones HTTP.
  * Manejo globalizado de excepciones y errores para impedir caídas del proceso Express.

### 3. Capa de Controladores / Presentación (`controladores/`)
* **Propósito:** Actúa como punto de entrada de la petición HTTP a la lógica interna de la aplicación.
* **Responsabilidades:**
  * Recibir los objetos `request` y `response` de Express.
  * Extraer parámetros, cuerpo (`body`) y cabeceras de la petición.
  * Delegar la ejecución a la capa de servicios.
  * Estructurar y enviar las respuestas HTTP de forma consistente mediante utilidades estandarizadas.

### 4. Capa de Servicios / Lógica de Negocio (`servicios/`)
* **Propósito:** Contiene las reglas de negocio del dominio Pizza Pizza.
* **Responsabilidades:**
  * Validar si se cumplen las condiciones de negocio (por ejemplo: si hay suficiente ingrediente en inventario para realizar una orden).
  * Coordinar múltiples llamadas a modelos en caso de transacciones complejas.
  * Integrar servicios de terceros o utilidades avanzadas (como el envío de correos electrónicos, facturación, etc.).
  * Esta capa es completamente independiente de los protocolos de red (no tiene conocimiento de HTTP o Express).

### 5. Capa de Modelos / Persistencia (`modelos/`)
* **Propósito:** interactuar directamente con el motor de base de datos MySQL.
* **Responsabilidades:**
  * Ejecutar consultas SQL (SELECT, INSERT, UPDATE, DELETE).
  * Mapear registros de base de datos a objetos entendibles por los servicios.
  * Asegurar el uso seguro de sentencias preparadas para prevenir inyecciones SQL.

---

## Flujo de Datos en una Operación Común

Tomando como ejemplo la creación de un nuevo pedido:

1. **Cliente** envía una solicitud `POST /api/pedidos` con el detalle del pedido en formato JSON.
2. **Rutas** intercepta la petición en `pedidos.rutas.js` y ejecuta el middleware de validación del token JWT.
3. **Middlewares** verifica que el token de usuario sea legítimo y añade la información del usuario a la petición.
4. **Controlador** (`pedidos.controlador.js`) recibe la petición validada, extrae el detalle y llama al servicio `PedidosServicio.crearPedido(...)`.
5. **Servicio** (`pedidos.servicio.js`) analiza la regla de negocio: verifica inventario, calcula el subtotal y el IVA, y en caso de éxito, invoca al modelo `PedidosModelo.insertar(...)`.
6. **Modelo** (`pedidos.modelos.js`) inserta los datos en la base de datos MySQL a través de la conexión establecida en `configuracion/conexion.js`.
7. El flujo retorna de forma inversa, y el **Controlador** responde al cliente con un estado HTTP 201 y una estructura estandarizada de éxito.

---

## Configuración y Variables de Entorno

El archivo `.env` configura el comportamiento y la conectividad del servidor. Las variables necesarias se describen a continuación:

* `PUERTO`: Puerto donde escuchará la aplicación (por defecto 3000).
* `BD_HOST`: Servidor de la base de datos MySQL.
* `BD_USUARIO`: Usuario de la base de datos.
* `BD_CONTRASENA`: Contraseña de la base de datos.
* `BD_NOMBRE`: Nombre de la base de datos del sistema.
* `BD_PUERTO`: Puerto de la base de datos (por defecto 3306).
* `JWT_SECRETO`: Clave secreta para firmar los tokens JWT.
* `CLAVE_ENCRIPTACION`: Clave utilizada para cifrar información sensible antes de persistirla.
* `NIVEL_LOG`: Nivel de detalle para los logs de la consola (ej. `info`, `error`).
* `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`: Configuración de servidor de correo emisor para notificaciones del sistema.
