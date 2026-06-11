# Proyecto: Pizza Pizza - Experiencia Gourmet

Este proyecto es una aplicación web para la gestión y orden de pizzas gourmet, desarrollada utilizando Angular en el frontend y preparada para un backend.

## Estructura Completa del Proyecto

A continuación se detalla la estructura organizativa y profesional del proyecto:

```text
proyecto/
├── README.md                          # Documentación general y estructura del proyecto
├── angular.json                       # Configuración de compilación y empaquetado de Angular
├── package.json                       # Dependencias y scripts de ejecución
├── tsconfig.json                      # Configuración de compilación de TypeScript
├── backend/                           # Directorio destinado a la lógica de backend (actualmente vacío)
├── pruebas/                           # Bocetos y prototipos HTML estáticos
│   ├── login.html                     # Maquetación estática de la página de inicio de sesión
│   ├── pizzeria.html                  # Maquetación estática de la landing page
│   ├── cliente.html                   # Maquetación estática del panel de cliente
│   ├── admin.html                     # Maquetación estática del panel de administrador
│   ├── empleado.html                  # Maquetación estática del panel de empleado
│   └── datos-simulados.json           # Archivo maestro de mocks para base de datos [NUEVO]
└── frontend/                          # Capa de Frontend de la aplicación (Angular)
    ├── public/                        # Activos públicos y recursos estáticos
    │   └── iconos/                    # Iconos SVG de navegación del panel [NUEVO]
    └── src/                           # Código fuente del frontend
          ├── Styles/                    # Directorio único de estilos (Regla 7)
          │   ├── styles.css             # Punto de entrada de estilos globales e importación de TailwindCSS
          │   ├── landing-page.estilos.css # Estilos específicos para la landing page
          │   ├── login.estilos.css      # Estilos específicos para el inicio de sesión
          │   ├── cliente.estilos.css    # Estilos específicos para la vista del cliente
          │   ├── empleado.estilos.css    # Estilos específicos para la vista del empleado
          │   ├── administrador.estilos.css # Estilos específicos para la vista del administrador
          │   ├── menu.estilos.css       # Estilos específicos para la vista de menú [NUEVO]
          │   ├── procesar-compra.estilos.css # Estilos específicos para el procesamiento de compra [NUEVO]
          │   ├── grafica.estilos.css    # Estilos específicos para el componente de gráfica común [NUEVO]
          │   └── correo.estilos.css     # Estilos específicos para la plantilla de correo [NUEVO]
          ├── main.ts                    # Punto de entrada del bootstrap de Angular
          ├── index.html                 # Plantilla HTML principal
          └── app/                       # Directorio raíz del código Angular
              ├── core/                  # Elementos centrales de la aplicación
              │   ├── models/            # Modelos de datos del negocio
              │   │   ├── pizza.model.ts  # Interfaz del modelo de Pizza
              │   │   ├── usuario.model.ts # Interfaz del modelo de Usuario
              │   │   ├── producto.model.ts # Interfaz del modelo de Producto [NUEVO]
              │   │   ├── carrito.model.ts # Interfaz del modelo de Carrito [NUEVO]
              │   │   └── datos-simulados.ts # Constantes de datos mock del negocio [NUEVO]
              │   └── services/          # Servicios globales de negocio (Singleton)
              │       ├── autenticacion.service.ts # Servicio de gestión de autenticación
              │       ├── carrito.service.ts     # Servicio de control del carrito
              │       ├── alertas.service.ts     # Centralizador único de alertas y errores [NUEVO]
              │       └── pedido.service.ts      # Control de pedidos y simulación activa [NUEVO]
              ├── shared/                # Elementos comunes reutilizables
              │   └── components/        # Componentes UI reutilizables
              │       ├── grafica/       # Componente de gráfica de barras común [NUEVO]
              │       │   ├── grafica.component.ts
              │       │   └── grafica.component.html
              │       └── correo/        # Componente de plantilla de correo [NUEVO]
              │           ├── correo.component.ts
              │           └── correo.component.html
              ├── features/              # Características / Módulos de página
              │   ├── landing-page/      # Componente de la vista de aterrizaje
              │   │   ├── landing-page.component.ts
              │   │   └── landing-page.component.html
              │   ├── login-page/        # Componente de inicio de sesión
              │   │   ├── login-page.component.ts
              │   │   └── login-page.component.html
              │   ├── cliente/           # Componente de la vista del cliente
              │   │   ├── cliente.component.ts
              │   │   └── cliente.component.html
              │   ├── empleado/          # Componente de la vista del empleado
              │   │   ├── empleado.component.ts
              │   │   ├── empleado.component.html
              │   │   └── components/        # Subcomponentes desacoplados del empleado [NUEVO]
              │   │       ├── tablero-kanban/ # Subcomponente de tablero Kanban de pedidos
              │   │       ├── vista-cocina/   # Subcomponente de cocina y armado
              │   │       ├── vista-entregas/ # Subcomponente de reparto y despacho
              │   │       ├── vista-inventario/# Subcomponente de gestión de insumos
              │   │       ├── vista-notificaciones/# Subcomponente de alertas del sistema
              │   │       └── vista-corte/    # Subcomponente de corte de caja diario [NUEVO]
              │   ├── administrador/     # Componente de la vista del administrador
              │   │   ├── administrador.component.ts
              │   │   ├── administrador.component.html
              │   │   └── components/        # Subcomponentes desacoplados del panel [NUEVO]
              │   │       ├── dashboard/     # Subcomponente de visualización de KPIs
              │   │       ├── productos/     # Subcomponente de catálogo y checklist de ingredientes
              │   │       ├── inventario/    # Subcomponente de stock de insumos
              │   │       ├── pedidos/       # Subcomponente de preparación y estados de pedidos
              │   │       ├── empleados/     # Subcomponente de directorio de personal
              │   │       ├── sucursales/    # Subcomponente de ubicaciones de negocio
              │   │       ├── reportes/      # Subcomponente de reportes y gráficas
              │   │       ├── facturacion/   # Subcomponente de emisión de CFDI
              │   │       └── configuracion/ # Subcomponente de ajustes fiscales y tasa de IVA
              │   ├── menu/              # Componente de la vista del menú [NUEVO]
              │   │   ├── menu.component.ts
              │   │   └── menu.component.html
              │   ├── procesar-compra/   # Componente para procesar compras (Checkout) [NUEVO]
              │   │   ├── procesar-compra.component.ts
              │   │   └── procesar-compra.component.html
              │   └── facturacion/       # Componente de la vista de facturación unificada [NUEVO]
              │       ├── facturacion.component.ts
              │       └── facturacion.component.html
              ├── app.config.ts          # Proveedores globales de la aplicación
              ├── app.routes.ts          # Configuración de rutas del sistema
              └── app.ts                 # Componente raíz del frontend
```
