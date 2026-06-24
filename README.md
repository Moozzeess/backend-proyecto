# Pizza Pizza - Proyecto de Gestión y Órdenes Gourmet

Este archivo contiene las instrucciones generales de instalación y ejecución del proyecto, así como los detalles de las versiones utilizadas.

## Estructura del Proyecto

El proyecto está organizado en un monorrepositorio que separa de forma estricta el frontend y el backend:

```text
proyecto/
├── backend/                   # Backend de la aplicación en Node.js y MySQL
│   ├── configuracion/         # Configuración de base de datos y variables de entorno
│   ├── controladores/         # Controladores (Capa de Presentación / Controladores API)
│   ├── modelos/               # Modelos (Interacción directa con la base de datos MySQL)
│   │   └── actualizacion_administrador.sql # Script SQL para actualizar la BD del administrador [NUEVO]
│   ├── rutas/                 # Endpoints y definición del enrutador de la API
│   ├── middlewares/           # Middlewares de seguridad, validación y manejo de errores
│   ├── servicios/             # Capa de lógica de negocio (Casos de uso)
│   ├── utilidades/            # Funciones auxiliares y herramientas comunes
│   ├── README.md              # Documentación detallada del backend
│   └── servidor.js            # Punto de entrada de la aplicación
├── frontend/                  # Frontend de la aplicación en Angular
│   ├── src/                   # Código fuente de Angular
│   │   └── app/
│   │       └── core/
│   │           └── services/
│   │               ├── empleado.service.ts # Servicio de Empleados del administrador [NUEVO]
│   │               ├── sucursal.service.ts # Servicio de Sucursales del administrador [NUEVO]
│   │               ├── inventario.service.ts # Servicio de Inventario del administrador [NUEVO]
│   │               └── factura.service.ts  # Servicio de Facturas del administrador [NUEVO]
│   └── README.md              # Organización general del frontend
├── pruebas/                   # Directorio de pruebas y simulación
│   └── datos-simulados.json   # Datos de prueba para simulación
├── agents.md                  # Guía y directrices para agentes de IA [NUEVO]
├── package.json               # Configuración de dependencias de la raíz
└── README.md                  # Este archivo (instrucciones y estructura general)
```


## Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (Versión recomendada: v20 o superior)
- **NPM** (Versión recomendada: v10 o superior)

---

## Instrucciones de Instalación

Sigue estos pasos para instalar y preparar el entorno de desarrollo local:

1. **Instalación de Dependencias**:
   Ejecuta el siguiente comando en la raíz del proyecto para instalar todos los paquetes y dependencias del frontend y las herramientas de construcción:
   ```bash
   npm install
   ```

2. **Verificación de Herramientas**:
   Asegúrate de que la CLI de Angular esté disponible. Se instalará localmente con el proyecto.

---

## Ejecución del Proyecto en Desarrollo

Para arrancar el servidor de desarrollo local y previsualizar la aplicación:

1. **Iniciar el Servidor de Desarrollo**:
   Corre el comando de inicio configurado:
   ```bash
   npm run start
   ```
   *Este comando compilará la aplicación y la mantendrá en escucha en el puerto por defecto (habitualmente [http://localhost:4200](http://localhost:4200)).*

2. **Compilación para Producción**:
   Si deseas compilar los archivos finales y optimizados para su despliegue:
   ```bash
   npm run build
   ```

---

## Tecnologías y Versiones Utilizadas

### Frontend
- **Angular**: ^21.2.0 (Componentes Standalone y Signals reactivos)
- **Tailwind CSS**: ^4.1.12 (Directivas nativas e importaciones globales CSS)
- **Bootstrap**: ^5.3.8 (Estilos y componentes responsivos adicionales)
- **jsPDF**: ^4.2.1 (Generación y manipulación de documentos PDF en el cliente)
- **PostCSS**: ^8.5.3
- **TypeScript**: ~5.9.2
- **NPM**: v11.9.0

### Backend
- **Express**: ^4.21.2 (Framework de servidor web y APIs HTTP)
- **Nodemailer**: ^9.0.1 (Envío de correos electrónicos a través de protocolo SMTP)
- **PDFKit**: ^0.19.1 (Generación dinámica de reportes y documentos PDF en el servidor)
- **MySQL2**: ^3.12.0 (Controlador cliente de base de datos MySQL con soporte para promesas)
- **JSONWebToken (JWT)**: ^9.0.3 (Manejo seguro de sesiones y autenticación basada en tokens)
- **BcryptJS**: ^3.0.3 (Algoritmo de hashing seguro para contraseñas de usuarios)
- **Helmet**: ^8.0.0 (Seguridad y protección mediante cabeceras HTTP)
- **Stream-Buffers**: ^3.0.3 (Manejo de streams en memoria para procesamiento de adjuntos)
