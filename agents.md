# Guía para Agentes de Inteligencia Artificial (agents.md)

Este documento define las reglas de desarrollo, la arquitectura, los estándares de código y las pautas que deben seguir todos los agentes de IA que colaboren en el proyecto Pizza Pizza.

---

## 1. Comunicación y Razonamiento

* **Idioma:** Todas las explicaciones, respuestas, razonamientos y mensajes del agente deben redactarse en español.
* **Justificación:** Cada decisión técnica o cambio arquitectónico debe acompañarse de una justificación clara.
* **Explicación de Cambios:** Al realizar modificaciones o correcciones de errores, se debe documentar explícitamente:
  * El error detectado.
  * La causa raíz del problema.
  * La solución implementada.
* **Tono:** Mantener un tono profesional y formal. Está estrictamente prohibido el uso de emojis o lenguaje informal.
* **Integridad:** Los cambios realizados no deben afectar negativamente el funcionamiento existente del proyecto.

---

## 2. Documentación de Código

* **Idioma de Documentación:** Todos los comentarios de código, clases, métodos, funciones e interfaces deben documentarse en español.
* **Estructura Requerida:** Toda documentación de funciones o métodos debe especificar de manera clara:
  * **Intención:** Qué hace la función y para qué sirve.
  * **Parámetros:** Nombre, tipo y propósito de cada argumento recibido.
  * **Retorno:** Tipo de dato y significado del valor de retorno.
  * **Casos Límite (Edge Cases):** Comportamiento ante valores nulos, vacíos o inesperados.
* **Calidad de Documentación:** Evitar comentarios redundantes o de relleno (por ejemplo: "Aquí empieza la función" o "Se hace la corrección").
* **Compatibilidad:** La documentación de los endpoints en el backend debe ser compatible con Swagger.
* **Notas de Desarrollo:** No dejar comentarios del tipo "TODO" o notas que indiquen continuar una función en el futuro.

---

## 3. Análisis del Proyecto y Organización

* **Evitar Duplicidad:** Antes de crear nuevos archivos o directorios, se debe realizar un análisis exhaustivo para reutilizar funciones existentes.
* **Límite de Líneas:** Los archivos de código fuente no deben superar las 500 líneas de código. Si un archivo excede este límite, se debe modularizar y dividir en componentes o funciones más pequeñas.
* **Actualización de Documentación:** Al modificar la estructura del proyecto, se debe actualizar inmediatamente el archivo `README.md` correspondiente.

---

## 4. Arquitectura y Estructura de Capas

* **Arquitectura Limpia:** Se sigue una arquitectura limpia que separa estrictamente la lógica de negocio de la lógica de presentación.
* **Independencia FE/BE:** El frontend (Angular) y el backend (Node.js) deben ser totalmente independientes. No se debe compartir código directo entre ambos, pero se debe mantener la consistencia en los nombres de las variables y estructuras de datos.
* **Frontend:**
  * Debe ser completamente responsivo y progresivo.
  * Los estilos de los componentes deben estar en un solo directorio centralizado: `proyecto/src/Styles` (o el equivalente definido en la estructura del frontend).
  * **Paleta de Colores Principal:**
    * #f6d76b (Amarillo pastel)
    * #ff9036 (Naranja cálido)
    * #d6254d (Rojo intenso)
    * #ff5475 (Rosa vibrante)
    * #fdeba9 (Crema suave)
  * **Recursos Visuales:** Queda prohibido el uso de emojis en las vistas o el código. Utilizar iconos o archivos SVG del directorio `proyecto/frontend/public`.
* **Backend:**
  * Debe ser escalable, seguro y mantenible.
  * Estructura modularizada en controladores, servicios, modelos, middlewares y rutas.

---

## 5. Estilo y Nomenclatura

* **Idioma:** Las variables, funciones, métodos, archivos y clases deben nombrarse en español.
* **Descriptividad:** Evitar términos genéricos y poco descriptivos como "data", "info", "temp" o nombres de una sola letra.
* **Consistencia:** Mantener una nomenclatura camelCase para variables y funciones, y PascalCase para clases e interfaces en TypeScript/JavaScript.

---

## 6. Manejo de Errores y Alertas

* **Manejo Centralizado:** El manejo de errores y alertas debe implementarse a través de un único archivo centralizado tanto en frontend como en backend para garantizar consistencia.
* **Estructura del Error:** Cada excepción o respuesta de error debe devolver:
  * Una descripción técnica detallada (destinada al desarrollador/logs).
  * Una explicación clara y no técnica (destinada a ser leída por el usuario final).

---

## 7. Seguridad

* **Validación de Entradas:** Validar y sanitizar todas las entradas provenientes del usuario para prevenir inyecciones de código (SQL, XSS, etc.).
* **Datos Sensibles:**
  * Encriptar o aplicar algoritmos de hash a datos sensibles (contraseñas, tokens, tarjetas) antes de almacenarlos. Jamás guardarlos en texto plano.
  * No exponer información confidencial en los logs de auditoría o respuestas de la API.
* **Tokens y Sesiones:** Implementar un manejo seguro de sesiones y autenticación basado en estándares de la industria (por ejemplo, JWT).
* **CORS:** Configurar políticas de CORS restrictivas en las APIs del backend.

---

## 8. Gestión de Datos y Simulaciones

* **Datos de Prueba:** Cualquier dato simulado o mock para pruebas locales o demostraciones debe ubicarse exclusivamente en el archivo `proyecto/pruebas/datos-simulados.json`.
* **Prohibición de Hardcode:** No debe existir código con valores quemados (hardcodeado) en las clases, componentes o servicios.
* **Bases de Datos:**
  * No almacenar archivos binarios pesados (como imágenes, videos o PDFs) directamente en la base de datos MySQL. Se deben subir a un almacenamiento de objetos y guardar únicamente su URL o ruta.
  * Evitar almacenar estructuras JSON masivas o excesivamente anidadas en las columnas de la BD.
  * Utilizar VARCHAR de longitud variable y evitar el uso de CHAR para cadenas de tamaño variable para no desperdiciar espacio de almacenamiento.
