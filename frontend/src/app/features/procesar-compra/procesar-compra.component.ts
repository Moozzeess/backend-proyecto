import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service';
import { AlertasService, AlertaError } from '../../core/services/alertas.service';
import { AutenticacionService } from '../../core/services/autenticacion.service';

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
   * Intención: Verificar el estado del carrito y la sesión al inicializar.
   * Retorno: void.
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
   * Retorno: void.
   */
  procesarOrden(): void {
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

    // Si todo está correcto, registrar el pedido en el servicio centralizado
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

    // Mostrar éxito y redirigir
    this.mensajeExito.set('¡Compra procesada con éxito! Redirigiendo a tu pedido activo...');
    setTimeout(() => {
      this.router.navigate(['/cliente']);
    }, 1500);
  }
}
