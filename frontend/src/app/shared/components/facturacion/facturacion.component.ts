import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios
import { PedidoService, PedidoHistorico } from '../../../core/services/pedido.service';
import { AutenticacionService } from '../../../core/services/autenticacion.service';
import { AlertasService } from '../../../core/services/alertas.service';
import { GeneradorDocumentosService } from '../../../core/services/generador-documentos.service';

/**
 * Interfaz para modelar una Factura (CFDI) dentro del flujo.
 */
export interface FacturaDetalle {
  id: string;
  fechaHora: string;
  pedidoId: string;
  rfc: string;
  razonSocial: string;
  codigoPostal: string;
  usoCfdi: string;
  regimenFiscal: string;
  correo: string;
  total: number;
  estado: 'Emitida' | 'Cancelada';
  uuid: string;
}

/**
 * Componente: FacturacionRouteComponent (FacturacionComponent)
 * Intención: Proveer un centro unificado de facturación electrónica CFDI 4.0 adaptado por roles.
 *            Permite timbrar, descargar XML/PDF, enviar correos y realizar cancelaciones de folios fiscales.
 * Retorno: Instancia de FacturacionComponent.
 * Casos límite:
 *   - Si no hay sesión iniciada, permite alternar de forma interactiva entre roles para simular el comportamiento.
 *   - Si un usuario está autenticado, bloquea la selección al rol asignado.
 *   - Valida la estructura y formato estándar del RFC antes de proceder a la firma digital (timbrado).
 */
@Component({
  selector: 'app-facturacion-unificada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturacion.component.html'
})
export class FacturacionComponent implements OnInit {
  public servicioPedidos = inject(PedidoService);
  public servicioAuth = inject(AutenticacionService);
  private servicioAlertas = inject(AlertasService);
  private router = inject(Router);
  private generadorDocumentos = inject(GeneradorDocumentosService);

  // Exponer objeto Math global a la plantilla
  readonly Math = Math;

  // Rol activo (simulado o heredado de sesión)
  rolActivo: 'cliente' | 'empleado' | 'admin' = 'cliente';
  estaBloqueadoPorSesion: boolean = false;

  // Paso activo en el stepper (de 1 a 5)
  pasoActivo: number = 1;

  // Formulario de Datos Fiscales
  datosFiscales = {
    rfc: '',
    razonSocial: '',
    codigoPostal: '',
    usoCfdi: 'G03 - Gastos en general',
    regimenFiscal: '601 - General de Ley Personas Morales',
    correo: ''
  };

  // Campo de búsqueda de ticket
  idTicketBusqueda: string = '';

  // Lista de Clientes Similados (para Empleado y Administrador)
  clientesSimulados = [
    { rfc: 'SOP870215TX1', razonSocial: 'Soluciones Operativas S.A.', codigoPostal: '03100', usoCfdi: 'G03 - Gastos en general', regimenFiscal: '601 - General de Ley Personas Morales', correo: 'contacto@soluciones.com' },
    { rfc: 'GOM941012AB3', razonSocial: 'Juan Gómez Martínez', codigoPostal: '54000', usoCfdi: 'D01 - Honorarios médicos', regimenFiscal: '612 - Personas Físicas con Actividades Empresariales y Profesionales', correo: 'juan.gomez@correo.com' },
    { rfc: 'XAXX010101000', razonSocial: 'Público en General', codigoPostal: '01000', usoCfdi: 'S01 - Sin efectos fiscales', regimenFiscal: '616 - Sin obligaciones fiscales', correo: 'publico@correo.com' }
  ];

  // Configuración SAT / PAC / Certificados / Emisor (Solo editable por Admin, solo lectura para Empleado, invisible para Cliente)
  configuracionSat = {
    pacNombre: 'Finkok PAC autorizado',
    pacRfc: 'PAC0803056T2',
    certificadoNo: '20001000000300022762',
    certificadoVigencia: '2028-12-31',
    serieActiva: 'A',
    folioSiguiente: 4501,
    regimenEmisor: '601 - General de Ley Personas Morales',
    nombreEmisor: 'Pizza Pizza Gourmet S.A. de C.V.',
    rfcEmisor: 'PPG120405PZ1',
    codigoPostalEmisor: '06600',
    complementoActivo: 'Ninguno'
  };

  // Pedido seleccionado para facturar obtenido del signal centralizado
  get pedidoSeleccionado(): PedidoHistorico | null {
    return this.servicioPedidos.pedidoParaFacturar();
  }
  set pedidoSeleccionado(val: PedidoHistorico | null) {
    this.servicioPedidos.pedidoParaFacturar.set(val);
  }

  // Factura generada activamente o seleccionada para vista previa
  facturaActiva: FacturaDetalle | null = null;

  // Listado de facturas en el sistema sincronizado por getter
  get listaFacturas(): FacturaDetalle[] {
    return this.servicioPedidos.listaFacturas();
  }

  // Alertas locales
  mensajeExito: string = '';
  mensajeError: string = '';

  /**
   * Intención: Inicializar el rol en base al usuario autenticado.
   * Retorno: void.
   */
  ngOnInit(): void {
    const usuario = this.servicioAuth.usuarioActual();
    if (usuario) {
      this.rolActivo = usuario.rol as 'cliente' | 'empleado' | 'admin';
      this.estaBloqueadoPorSesion = true;
    } else {
      this.rolActivo = 'cliente';
      this.estaBloqueadoPorSesion = false;
    }

    // Si ya viene pre-seleccionado un pedido desde fuera, avanzamos
    if (this.pedidoSeleccionado) {
      this.pasoActivo = 2;
    } else {
      // Auto-seleccionar primer pedido pagado para pruebas rápidas
      const pedidos = this.servicioPedidos.historialPedidos();
      const pagado = pedidos.find(p => p.estado === 'pagado');
      if (pagado) {
        this.pedidoSeleccionado = pagado;
        this.pasoActivo = 2;
      }
    }
  }

  /**
   * Intención: Cambiar el rol de facturación (sólo si no hay sesión activa fija).
   * Parámetros:
   *   - nuevoRol: 'cliente' | 'empleado' | 'admin' - Rol a activar.
   * Retorno: void.
   */
  seleccionarRol(nuevoRol: 'cliente' | 'empleado' | 'admin'): void {
    if (this.estaBloqueadoPorSesion) {
      return;
    }
    this.rolActivo = nuevoRol;
    this.limpiarEstado();
  }

  /**
   * Intención: Seleccionar un pedido del historial para facturarlo.
   * Parámetros:
   *   - pedido: PedidoHistorico - Pedido seleccionado.
   * Retorno: void.
   */
  seleccionarPedido(pedido: PedidoHistorico): void {
    if (pedido.estado !== 'pagado' && pedido.estado !== 'Entregado') {
      this.mostrarError('Solo se pueden facturar pedidos pagados o entregados.');
      return;
    }
    this.pedidoSeleccionado = pedido;
    this.pasoActivo = 2;
  }

  /**
   * Intención: Buscar un ticket por folio o ID dentro del historial de pedidos del servicio.
   * Retorno: void.
   */
  buscarTicket(): void {
    if (!this.idTicketBusqueda.trim()) {
      this.mostrarError('Por favor, ingresa el folio o ID del ticket.');
      return;
    }
    const pedidos = this.servicioPedidos.historialPedidos();
    const encontrado = pedidos.find(p => p.id.toLowerCase() === this.idTicketBusqueda.trim().toLowerCase());
    if (encontrado) {
      this.seleccionarPedido(encontrado);
      this.mostrarExito('Ticket encontrado. Procede con la facturación.');
    } else {
      this.mostrarError('No se encontró ningún ticket con el folio especificado.');
    }
  }

  /**
   * Intención: Autocompletar el formulario de datos fiscales seleccionando un cliente pre-registrado.
   * Parámetros:
   *   - cliente: Cliente a seleccionar.
   * Retorno: void.
   */
  seleccionarCliente(cliente: typeof this.clientesSimulados[0]): void {
    this.datosFiscales.rfc = cliente.rfc;
    this.datosFiscales.razonSocial = cliente.razonSocial;
    this.datosFiscales.codigoPostal = cliente.codigoPostal;
    this.datosFiscales.usoCfdi = cliente.usoCfdi;
    this.datosFiscales.regimenFiscal = cliente.regimenFiscal;
    this.datosFiscales.correo = cliente.correo;
    this.mostrarExito('Cliente seleccionado correctamente.');
  }

  /**
   * Intención: Avanzar al siguiente paso del stepper de facturación.
   * Retorno: void.
   */
  siguientePaso(): void {
    if (this.pasoActivo === 1 && !this.pedidoSeleccionado) {
      this.mostrarError('Selecciona un pedido para continuar.');
      return;
    }
    if (this.pasoActivo === 2) {
      const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9]\d$/i;
      if (!rfcRegex.test(this.datosFiscales.rfc)) {
        this.mostrarError('El RFC ingresado no tiene un formato válido.');
        return;
      }
      if (!this.datosFiscales.razonSocial.trim()) {
        this.mostrarError('La Razón Social es obligatoria.');
        return;
      }
      if (!this.datosFiscales.codigoPostal.trim()) {
        this.mostrarError('El Código Postal es obligatorio.');
        return;
      }
    }
    if (this.pasoActivo < 5) {
      this.pasoActivo++;
    }
  }

  /**
   * Intención: Regresar al paso anterior del stepper.
   * Retorno: void.
   */
  retrocederPaso(): void {
    if (this.pasoActivo > 1) {
      this.pasoActivo--;
    }
  }

  /**
   * Intención: Timbrar electrónicamente la factura ante el SAT.
   * Retorno: void.
   */
  timbrarCFDI(): void {
    if (!this.pedidoSeleccionado) {
      this.mostrarError('No hay ningún pedido cargado para facturar.');
      return;
    }

    const folio = 'FAC-' + Math.floor(1000 + Math.random() * 9000);
    const uuidFicticio = '7A94C1D4-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-4EBA-A211-' + Math.random().toString(36).substring(2, 14).toUpperCase();
    const fechaActualStr = new Date().toLocaleString('es-MX', { hour12: false }).substring(0, 17);

    const nuevaFactura: FacturaDetalle = {
      id: folio,
      fechaHora: fechaActualStr,
      pedidoId: this.pedidoSeleccionado.id,
      rfc: this.datosFiscales.rfc.toUpperCase(),
      razonSocial: this.datosFiscales.razonSocial,
      codigoPostal: this.datosFiscales.codigoPostal,
      usoCfdi: this.datosFiscales.usoCfdi,
      regimenFiscal: this.datosFiscales.regimenFiscal,
      correo: this.datosFiscales.correo || 'cliente@correo.com',
      total: this.pedidoSeleccionado.total,
      estado: 'Emitida',
      uuid: uuidFicticio
    };

    const lista = this.servicioPedidos.listaFacturas();
    this.servicioPedidos.listaFacturas.set([nuevaFactura, ...lista]);
    this.facturaActiva = nuevaFactura;
    this.pasoActivo = 5; // Ir a la vista previa / descarga
    this.mostrarExito(`Factura ${folio} timbrada exitosamente.`);
  }

  /**
   * Intención: Cancelar un folio de factura emitido (exclusivo Admin).
   * Parámetros:
   *   - facturaId: string - Folio a cancelar.
   * Retorno: void.
   */
  cancelarFactura(facturaId: string): void {
    if (this.rolActivo !== 'admin') {
      this.mostrarError('Acción restringida: Solo el administrador puede cancelar facturas.');
      return;
    }
    const lista = this.servicioPedidos.listaFacturas();
    const actualizadas = lista.map(f => f.id === facturaId ? { ...f, estado: 'Cancelada' as const } : f);
    this.servicioPedidos.listaFacturas.set(actualizadas);
    this.mostrarExito(`Factura ${facturaId} cancelada correctamente ante el SAT.`);
  }

  /**
   * Intención: Descargar la factura activa en formato PDF.
   * Retorno: void.
   */
  descargarPDF(): void {
    if (!this.facturaActiva) return;
    this.generadorDocumentos.descargarFacturaPDF(this.facturaActiva);
    this.mostrarExito(`Descargando PDF de la factura ${this.facturaActiva.id}...`);
  }

  /**
   * Intención: Descargar la factura activa en formato XML.
   * Retorno: void.
   */
  descargarXML(): void {
    if (!this.facturaActiva) return;
    this.generadorDocumentos.descargarFacturaXML(this.facturaActiva);
    this.mostrarExito(`Descargando XML de la factura ${this.facturaActiva.id}...`);
  }

  /**
   * Intención: Descargar una factura seleccionada en formato PDF desde el historial.
   * Parámetros:
   *   - factura (any): Objeto factura.
   * Retorno: void.
   */
  descargarFacturaPDF(factura: any): void {
    this.generadorDocumentos.descargarFacturaPDF(factura);
    this.mostrarExito(`Descargando PDF de la factura ${factura.id}...`);
  }

  /**
   * Intención: Descargar una factura seleccionada en formato XML desde el historial.
   * Parámetros:
   *   - factura (any): Objeto factura.
   * Retorno: void.
   */
  descargarFacturaXML(factura: any): void {
    this.generadorDocumentos.descargarFacturaXML(factura);
    this.mostrarExito(`Descargando XML de la factura ${factura.id}...`);
  }

  /**
   * Intención: Enviar de forma simulada el correo electrónico.
   * Retorno: void.
   */
  enviarCorreo(): void {
    if (!this.facturaActiva) return;
    this.mostrarExito(`Factura enviada al correo ${this.facturaActiva.correo}`);
  }

  /**
   * Intención: Limpiar el estado y campos para iniciar una nueva facturación.
   * Retorno: void.
   */
  limpiarEstado(): void {
    this.pedidoSeleccionado = null;
    this.facturaActiva = null;
    this.pasoActivo = 1;
    this.datosFiscales = {
      rfc: '',
      razonSocial: '',
      codigoPostal: '',
      usoCfdi: 'G03 - Gastos en general',
      regimenFiscal: '601 - General de Ley Personas Morales',
      correo: ''
    };
  }

  /**
   * Intención: Redireccionar al panel principal respectivo del rol autenticado.
   * Retorno: void.
   */
  volverAlPanel(): void {
    const usuario = this.servicioAuth.usuarioActual();
    if (usuario) {
      this.router.navigate([`/${usuario.rol}`]);
    } else {
      this.router.navigate(['/']);
    }
  }

  private mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => { if (this.mensajeExito === mensaje) this.mensajeExito = ''; }, 3500);
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => { if (this.mensajeError === mensaje) this.mensajeError = ''; }, 3500);
  }
}
