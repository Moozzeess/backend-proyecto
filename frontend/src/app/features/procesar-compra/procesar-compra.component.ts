import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { AlertasService, AlertaError } from '../../core/services/alertas.service';
import { AutenticacionService } from '../../core/services/autenticacion.service';

declare var google: any;

/**
 * Componente: ProcesarCompraComponent
 * Intención: Administrar la interfaz y lógica para la confirmación de la compra,
 *            datos de envío y selección del método de pago de los artículos del carrito.
 * Casos límite:
 *   - Si el carrito está vacío, no permite finalizar compra y muestra advertencia.
 *   - Si el usuario no está autenticado, lo redirige al Login.
 *   - Valida dinámicamente según el tipo de entrega y método de pago seleccionados.
 */
@Component({
  selector: 'app-procesar-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procesar-compra.component.html'
})
export class ProcesarCompraComponent implements OnInit {
  /** Método de entrega: 'domicilio' o 'sucursal'. */
  metodoEntrega = signal<string>('domicilio');

  /** Método de pago: 'tarjeta' o 'efectivo'. */
  metodoPago = signal<string>('tarjeta');

  /** Datos del cliente para el pedido. */
  nombreCliente = signal<string>('');
  telefonoCliente = signal<string>('');

  /** Datos de envío (Domicilio). */
  calle = signal<string>('');
  numeroExterior = signal<string>('');
  codigoPostal = signal<string>('');
  referencia = signal<string>('');

  /** Datos del método de pago (Tarjeta). */
  nombreTarjeta = signal<string>('');
  numeroTarjeta = signal<string>('');
  fechaExpiracion = signal<string>('');
  codigoVerificacion = signal<string>('');

  /** Control de Facturación durante el pago */
  solicitarFactura = signal<boolean>(false);
  rfcFactura = signal<string>('');
  razonSocialFactura = signal<string>('');
  codigoPostalFactura = signal<string>('');
  usoCfdiFactura = signal<string>('G03 - Gastos en general');

  /** Objeto de alerta actual si ocurre algún error de validación. */
  alertaActual = signal<AlertaError | null>(null);

  /** Signal para mostrar una alerta de éxito simulada antes de redirigir. */
  mensajeExito = signal<string>('');

  /**
   * Signal para controlar el estado del proceso de pago.
   * Evita transacciones duplicadas por doble clic e indica cuándo mostrar la animación de carga.
   */
  procesandoPago = signal<boolean>(false);

  /** Referencia del mapa de Google */
  mapa: any = null;

  /** Referencia del marcador en el mapa */
  marcador: any = null;

  /** Bandera para habilitar un mapa simulado si no carga la API Key de Google Maps */
  usarMapaSimulado = signal<boolean>(false);

  /** Enlace directo al listado del carrito global. */
  elementosCarrito = computed(() => this.carritoService.carrito());

  /** Costo total acumulado del carrito. */
  totalPagar = computed(() => this.carritoService.totalPagar());

  /** Costo de envío (fijo $45 si es a domicilio, $0 si es sucursal). */
  costoEnvio = computed(() => {
    return this.metodoEntrega() === 'domicilio' ? 45 : 0;
  });

  /** Suma total final a pagar (Total + Costo Envío). */
  totalFinal = computed(() => {
    return this.totalPagar() + this.costoEnvio();
  });

  /**
   * Constructor de la vista de procesamiento de compras.
   * Intención: Inyectar servicios principales del carrito, pedidos, autenticación, alertas y router.
   * Parámetros:
   *   - carritoService (CarritoService): Gestor del carrito.
   *   - pedidoService (PedidoService): Gestor del pedido activo.
   *   - alertasService (AlertasService): Proveedor centralizado de errores.
   *   - autenticacionService (AutenticacionService): Gestor de sesión.
   *   - router (Router): Navegación entre rutas.
   */
  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private alertasService: AlertasService,
    private autenticacionService: AutenticacionService,
    private router: Router
  ) {}

  /**
   * Intención: Verificar el estado del carrito y la sesión al inicializar, y cargar la API de mapas si aplica.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si el método por defecto es domicilio, inicia la carga dinámica del mapa.
   */
  ngOnInit(): void {
    // Si no está autenticado, redirigir al login guardando retorno
    if (!this.autenticacionService.estaAutenticado()) {
      this.router.navigate(['/login'], { queryParams: { redireccion: '/procesar-compra' } });
      return;
    }

    // Rellenar datos por defecto con la sesión del usuario si está disponible
    const usuario = this.autenticacionService.usuarioActual();
    if (usuario) {
      this.nombreCliente.set(usuario.nombre);
      if (usuario.telefono) {
        this.telefonoCliente.set(usuario.telefono);
      }
    }

    // Inicializar mapa si el método por defecto es domicilio
    if (this.metodoEntrega() === 'domicilio') {
      setTimeout(() => {
        this.cargarGoogleMaps();
      }, 200);
    }
  }

  /**
   * Carga de forma asíncrona la API de Google Maps o activa el simulador si ocurre un error.
   * Intención: Asegurar la disponibilidad de mapas para seleccionar dirección de entrega.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si la API ya está en memoria, invoca directamente la inicialización.
   *   - Si la carga por red falla o se bloquea, activa usarMapaSimulado.
   */
  cargarGoogleMaps(): void {
    if ((window as any).google && (window as any).google.maps) {
      this.inicializarMapa();
      return;
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      return;
    }

    // Callback global requerido por la API asíncrona de Google Maps
    (window as any).initGoogleMapsCallback = () => {
      this.inicializarMapa();
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      this.usarMapaSimulado.set(true);
    };

    document.head.appendChild(script);

    // Timeout de respaldo por si el script tarda demasiado (ej. sin internet o bloqueado por AdBlock)
    setTimeout(() => {
      if (!((window as any).google && (window as any).google.maps)) {
        this.usarMapaSimulado.set(true);
      }
    }, 4000);
  }

  /**
   * Inicializa la vista del mapa e instala el marcador arrastrable.
   * Intención: Permitir la interacción visual en el mapa para ajustar coordenadas.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si el contenedor del mapa en el DOM no está listo, aborta.
   *   - Si la inicialización del objeto Google Map falla, activa usarMapaSimulado.
   */
  inicializarMapa(): void {
    const contenedor = document.getElementById('mapa-pedido');
    if (!contenedor) return;

    const cdmx = { lat: 19.4326, lng: -99.1332 };

    try {
      this.mapa = new google.maps.Map(contenedor, {
        center: cdmx,
        zoom: 15,
        disableDefaultUI: false,
        zoomControl: true
      });

      this.marcador = new google.maps.Marker({
        position: cdmx,
        map: this.mapa,
        draggable: true,
        title: 'Arrastra para ubicar tu entrega'
      });

      // Escuchar evento de arrastre para recuperar la dirección
      this.marcador.addListener('dragend', () => {
        const posicion = this.marcador.getPosition();
        if (posicion) {
          this.obtenerDireccionDesdeCoordenadas(posicion.lat(), posicion.lng());
        }
      });

      // Obtener dirección inicial
      this.obtenerDireccionDesdeCoordenadas(cdmx.lat, cdmx.lng);
    } catch (e) {
      this.usarMapaSimulado.set(true);
    }
  }

  /**
   * Realiza la geocodificación inversa a partir de coordenadas geográficas.
   * Intención: Autocompletar dinámicamente los campos de dirección mediante coordenadas.
   * Parámetros:
   *   - lat (number): Latitud de la ubicación.
   *   - lng (number): Longitud de la ubicación.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si el Geocoder falla o no retorna datos válidos, no modifica los campos.
   */
  obtenerDireccionDesdeCoordenadas(lat: number, lng: number): void {
    if (!(window as any).google || !google.maps.Geocoder) {
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (resultados: any[], status: string) => {
        if (status === 'OK' && resultados && resultados[0]) {
          const direccionComponentes = resultados[0].address_components;
          let calleVal = '';
          let numeroVal = '';
          let cpVal = '';

          for (const componente of direccionComponentes) {
            const tipos = componente.types;
            if (tipos.includes('route')) {
              calleVal = componente.long_name;
            } else if (tipos.includes('street_number')) {
              numeroVal = componente.long_name;
            } else if (tipos.includes('postal_code')) {
              cpVal = componente.long_name;
            }
          }

          if (calleVal) this.calle.set(calleVal);
          if (numeroVal) this.numeroExterior.set(numeroVal);
          if (cpVal) this.codigoPostal.set(cpVal);
        }
      });
    } catch (error) {
      console.warn('Geocodificación inversa fallida:', error);
    }
  }

  /**
   * Geolocaliza el dispositivo del usuario centrando el mapa en su posición actual.
   * Intención: Agilizar el llenado de la dirección mediante geolocalización nativa.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si el navegador no soporta geolocalización o el permiso es denegado, no realiza cambios.
   */
  geolocalizarUsuario(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const lat = posicion.coords.latitude;
          const lng = posicion.coords.longitude;
          const coords = { lat, lng };

          if (this.mapa && this.marcador) {
            this.mapa.setCenter(coords);
            this.marcador.setPosition(coords);
            this.obtenerDireccionDesdeCoordenadas(lat, lng);
          } else {
            // Relleno simulado si no está cargado Google Maps
            this.calle.set('Avenida Paseo de la Reforma');
            this.numeroExterior.set('222');
            this.codigoPostal.set('06600');
          }
        },
        () => {
          // Si falla, se puede rellenar un simulado básico
          this.calle.set('Av. Juárez');
          this.numeroExterior.set('50');
          this.codigoPostal.set('06010');
        }
      );
    }
  }

  /**
   * Simula la selección de una coordenada en el mapa simulado interactivo.
   * Intención: Permitir probar la funcionalidad de mapas interactivos sin depender de la red/Google API key.
   * Parámetros:
   *   - area (string): Zona seleccionada.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Actualiza con datos predefinidos realistas para cada zona de prueba.
   */
  seleccionarUbicacionSimulada(area: string): void {
    if (area === 'centro') {
      this.calle.set('Calle Madero');
      this.numeroExterior.set('10');
      this.codigoPostal.set('06000');
    } else if (area === 'roma') {
      this.calle.set('Avenida Álvaro Obregón');
      this.numeroExterior.set('180');
      this.codigoPostal.set('06700');
    } else if (area === 'polanco') {
      this.calle.set('Avenida Presidente Masaryk');
      this.numeroExterior.set('310');
      this.codigoPostal.set('11560');
    }
  }

  /**
   * Cambia el método de entrega seleccionado y limpia errores previos.
   * Intención: Alternar la UI y recalcular costos de envío.
   * Parámetros:
   *   - metodo (string): 'domicilio' o 'sucursal'.
   */
  cambiarMetodoEntrega(metodo: string): void {
    this.metodoEntrega.set(metodo);
    this.alertaActual.set(null);
    if (metodo === 'domicilio') {
      setTimeout(() => {
        this.cargarGoogleMaps();
      }, 200);
    }
  }

  /**
   * Cambia el método de pago seleccionado y limpia errores previos.
   * Intención: Alternar la UI de información financiera.
   * Parámetros:
   *   - metodo (string): 'tarjeta' o 'efectivo'.
   */
  cambiarMetodoPago(metodo: string): void {
    this.metodoPago.set(metodo);
    this.alertaActual.set(null);
  }

  /**
   * Procesa y confirma la orden de compra.
   * Intención: Validar los campos de entrega y pago, generar el pedido en preparación e iniciar la simulación.
   *           Implementa protección contra doble clic / doble pago desactivando el control y mostrando un loader.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si ya está procesando una orden (this.procesandoPago() === true), retorna inmediatamente para evitar cobros dobles.
   *   - Si el carrito está vacío o faltan datos obligatorios, muestra la alerta correspondiente y restaura el estado.
   */
  procesarOrden(): void {
    if (this.procesandoPago()) {
      return;
    }

    this.alertaActual.set(null);

    // Validar carrito vacío
    if (this.elementosCarrito().length === 0) {
      this.alertaActual.set(this.alertasService.obtenerError('CARRITO_VACIO'));
      return;
    }

    // Validar datos básicos de contacto
    if (!this.nombreCliente().trim() || !this.telefonoCliente().trim()) {
      this.alertaActual.set(this.alertasService.obtenerError('CAMPOS_VACIOS'));
      return;
    }

    // Validar datos de envío si es a domicilio
    let direccionCompleta = 'Sucursal Principal';
    if (this.metodoEntrega() === 'domicilio') {
      if (!this.calle().trim() || !this.numeroExterior().trim() || !this.codigoPostal().trim()) {
        this.alertaActual.set(this.alertasService.obtenerError('DIRECCION_FALTANTE'));
        return;
      }
      direccionCompleta = `${this.calle().trim()} #${this.numeroExterior().trim()}, C.P. ${this.codigoPostal().trim()}`;
      if (this.referencia().trim()) {
        direccionCompleta += ` (${this.referencia().trim()})`;
      }
    }

    // Validar datos de tarjeta si aplica
    if (this.metodoPago() === 'tarjeta') {
      const numT = this.numeroTarjeta().replace(/\s/g, '');
      const exp = this.fechaExpiracion().trim();
      const cvv = this.codigoVerificacion().trim();

      if (!this.nombreTarjeta().trim() || numT.length !== 16 || exp.length < 5 || cvv.length !== 3) {
        this.alertaActual.set(this.alertasService.obtenerError('TARJETA_INVALIDA'));
        return;
      }
    }

    // Validar datos de facturación si se solicita
    if (this.solicitarFactura()) {
      const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9]\d$/i;
      if (!rfcRegex.test(this.rfcFactura())) {
        this.alertaActual.set(this.alertasService.crearErrorPersonalizado(
          'RFC_INVALIDO',
          'ValidationError: Billing RFC format mismatch.',
          'El formato de RFC ingresado para la facturación no es válido.',
          'El formato del RFC de facturación es incorrecto.'
        ));
        return;
      }
      if (!this.razonSocialFactura().trim()) {
        this.alertaActual.set(this.alertasService.obtenerError('CAMPOS_VACIOS'));
        return;
      }
      if (!this.codigoPostalFactura().trim()) {
        this.alertaActual.set(this.alertasService.obtenerError('CAMPOS_VACIOS'));
        return;
      }
    }

    // Activar bandera de procesamiento de pago
    this.procesandoPago.set(true);

    // Simular un retraso en la pasarela de pago para dar tiempo a la animación (2 segundos)
    setTimeout(() => {
      // Registrar el pedido en el servicio centralizado
      this.pedidoService.crearPedido(
        this.elementosCarrito(),
        this.metodoEntrega(),
        direccionCompleta,
        this.telefonoCliente().trim(),
        this.metodoPago()
      );

      // Si solicitó factura, emitirla automáticamente en el servicio centralizado
      if (this.solicitarFactura()) {
        const pedidoCreado = this.pedidoService.pedidoActivo();
        const pedidoId = pedidoCreado ? pedidoCreado.id : '#' + Math.floor(1000 + Math.random() * 9000);
        const folio = 'FAC-' + Math.floor(1000 + Math.random() * 9000);
        const uuidFicticio = '7A94C1D4-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-4EBA-A211-' + Math.random().toString(36).substring(2, 14).toUpperCase();
        const fechaActualStr = new Date().toLocaleString('es-MX', { hour12: false }).substring(0, 17);

        const nuevaFactura = {
          id: folio,
          fechaHora: fechaActualStr,
          pedidoId: pedidoId,
          rfc: this.rfcFactura().toUpperCase(),
          razonSocial: this.razonSocialFactura().trim(),
          codigoPostal: this.codigoPostalFactura().trim(),
          usoCfdi: this.usoCfdiFactura(),
          regimenFiscal: '601 - General de Ley Personas Morales',
          correo: 'facturas@pizza.com',
          total: this.totalFinal(),
          estado: 'Emitida' as const,
          uuid: uuidFicticio
        };

        const lista = this.pedidoService.listaFacturas();
        this.pedidoService.listaFacturas.set([nuevaFactura, ...lista]);
      }

      // Limpiar carrito
      this.carritoService.limpiarCarrito();

      // Desactivar spinner de carga y mostrar éxito
      this.procesandoPago.set(false);
      this.mensajeExito.set('¡Compra procesada con éxito! Redirigiendo a tu pedido activo...');
      
      setTimeout(() => {
        this.router.navigate(['/cliente']);
      }, 1500);
    }, 2000);
  }
}
