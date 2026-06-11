import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { PedidoService, PedidoHistorico } from '../../core/services/pedido.service';
import { AlertasService, AlertaError } from '../../core/services/alertas.service';

// Modelos y Datos
import {
  PRODUCTOS_MOCK,
  INGREDIENTES_MOCK,
  EMPLEADOS_MOCK,
  SUCURSALES_MOCK,
  FACTURAS_MOCK,
  ProductoSimulado
} from '../../core/models/datos-simulados';

// Subcomponentes Desacoplados
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { SucursalesComponent } from './components/sucursales/sucursales.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { FacturacionComponent } from '../../shared/components/facturacion/facturacion.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';

export interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  precio: number;
  categoria: 'pizza' | 'bebida' | 'postre';
  tamano: 'individual' | 'mediano' | 'familiar' | 'no aplica';
}

export interface IngredienteInventario {
  id: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
}

export interface EmpleadoAdmin {
  id: number;
  nombre: string;
  puesto: string;
  sucursal: string;
  salario: number;
  estado: 'Activo' | 'Inactivo';
}

export interface SucursalAdmin {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  administrador: string;
  ventasTotales: number;
}

export interface FacturaAdmin {
  id: string;
  fechaHora: string;
  pedidoId: string;
  rfc: string;
  razonSocial: string;
  usoCfdi: string;
  total: number;
  estado: 'Emitida' | 'Cancelada';
}

/**
 * Componente: AdministradorComponent
 * Intención: Coordinar y gestionar el panel de administración centralizando colecciones de datos compartidas y distribuyendo la lógica por subcomponentes autónomos.
 * Parámetros: Ninguno.
 * Retorno: Instancia del componente AdministradorComponent.
 * Casos límite:
 *   - Si un subcomponente emite un error de validación, se atrapa en la capa superior y se activa la alerta de error.
 *   - Maneja la navegación dinámica entre módulos actualizando la sección activa.
 */
@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardComponent,
    ProductosComponent,
    InventarioComponent,
    PedidosComponent,
    EmpleadosComponent,
    SucursalesComponent,
    ReportesComponent,
    FacturacionComponent,
    ConfiguracionComponent
  ],
  templateUrl: './administrador.component.html'
})
export class AdministradorComponent implements OnInit {
  public servicioPedidos = inject(PedidoService);
  private servicioAlertas = inject(AlertasService);

  // Información del Administrador
  nombreRol: string = 'Administrador General';
  ventasHoyPesos: number = 48920;
  cantidadPedidos: number = 347;

  // Estado del Sidebar / Menú
  seccionActiva: 'dashboard' | 'productos' | 'inventario' | 'pedidos' | 'empleados' | 'sucursales' | 'reportes' | 'configuracion' | 'facturacion' = 'dashboard';

  // Manejo de Alertas Globales
  alertaActual: AlertaError | null = null;
  mensajeExito: string = '';

  // Colecciones de Datos Centralizadas
  listaProductos: ProductoAdmin[] = [];
  listaIngredientes: IngredienteInventario[] = [];
  listaEmpleados: EmpleadoAdmin[] = [];
  listaSucursales: SucursalAdmin[] = [];
  listaFacturas: FacturaAdmin[] = [];

  // Ingredientes del checklist
  ingredientesLlamativos: string[] = [
    'Queso Mozzarella',
    'Pepperoni',
    'Jamón York',
    'Piña Caramelizada',
    'Champiñones',
    'Chorizo',
    'Jalapeños',
    'Tocino Ahumado'
  ];

  // Configuración compartida
  configuracionNegocio = {
    nombreEmpresa: 'Pizza Pizza Gourmet S.A. de C.V.',
    direccionFiscal: 'Av. Paseo de la Reforma #505, CDMX',
    telefonoContacto: '800 749 9277',
    monedaCobro: 'MXN ($)',
    ivaPorcentaje: 16
  };

  // Estado del Pedido para Facturar
  pedidoParaFacturar: PedidoHistorico | null = null;

  ngOnInit(): void {
    // Inicializar colecciones desde constantes de datos simulados
    this.listaProductos = JSON.parse(JSON.stringify(PRODUCTOS_MOCK));
    this.listaIngredientes = JSON.parse(JSON.stringify(INGREDIENTES_MOCK));
    this.listaEmpleados = JSON.parse(JSON.stringify(EMPLEADOS_MOCK));
    this.listaSucursales = JSON.parse(JSON.stringify(SUCURSALES_MOCK));
    this.listaFacturas = JSON.parse(JSON.stringify(FACTURAS_MOCK));
  }

  cambiarSeccion(seccion: typeof this.seccionActiva): void {
    this.seccionActiva = seccion;
  }

  // Notificaciones de Alertas
  mostrarAlertaExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.alertaActual = null;
    setTimeout(() => { if (this.mensajeExito === mensaje) this.mensajeExito = ''; }, 3000);
  }

  mostrarAlertaError(mensaje: string): void {
    this.alertaActual = this.servicioAlertas.crearErrorPersonalizado('ERROR_ADMIN', 'ValidationError', 'Acción administrativa fallida.', mensaje);
    this.mensajeExito = '';
    setTimeout(() => { if (this.alertaActual?.mensajeUsuario === mensaje) this.alertaActual = null; }, 3000);
  }

  // --- CONTROL DE PRODUCTOS (Hijo -> Padre) ---
  alGuardarProducto(producto: ProductoAdmin): void {
    const indice = this.listaProductos.findIndex(p => p.id === producto.id);
    if (indice !== -1) {
      this.listaProductos[indice] = { ...producto };
      this.mostrarAlertaExito('Producto modificado de manera exitosa.');
    } else {
      const nuevoId = this.listaProductos.length > 0 ? Math.max(...this.listaProductos.map(p => p.id)) + 1 : 1;
      producto.id = nuevoId;
      this.listaProductos.push({ ...producto });
      this.mostrarAlertaExito('Nuevo producto registrado correctamente.');
    }
  }

  alEliminarProducto(productoId: number): void {
    const indice = this.listaProductos.findIndex(p => p.id === productoId);
    if (indice !== -1) {
      this.listaProductos.splice(indice, 1);
      this.mostrarAlertaExito('Producto removido del menú.');
    }
  }

  // --- CONTROL DE INVENTARIO (Hijo -> Padre) ---
  alReabastecerIngrediente(ingredienteId: number): void {
    const ingrediente = this.listaIngredientes.find(i => i.id === ingredienteId);
    if (ingrediente) {
      ingrediente.stockActual += 10;
      this.mostrarAlertaExito(`Se añadieron 10 ${ingrediente.unidad} de ${ingrediente.nombre}.`);
    }
  }

  // --- CONTROL DE EMPLEADOS (Hijo -> Padre) ---
  alGuardarEmpleado(empleado: EmpleadoAdmin): void {
    const indice = this.listaEmpleados.findIndex(e => e.id === empleado.id);
    if (indice !== -1) {
      this.listaEmpleados[indice] = { ...empleado };
      this.mostrarAlertaExito('Datos del empleado actualizados de forma exitosa.');
    } else {
      const nuevoId = this.listaEmpleados.length > 0 ? Math.max(...this.listaEmpleados.map(e => e.id)) + 1 : 1;
      empleado.id = nuevoId;
      this.listaEmpleados.push({ ...empleado });
      this.mostrarAlertaExito('Nuevo empleado registrado correctamente.');
    }
  }

  alConmutarEstadoEmpleado(empleadoId: number): void {
    const empleado = this.listaEmpleados.find(e => e.id === empleadoId);
    if (empleado) {
      empleado.estado = empleado.estado === 'Activo' ? 'Inactivo' : 'Activo';
      this.mostrarAlertaExito(`Estado de ${empleado.nombre} modificado a ${empleado.estado}.`);
    }
  }

  // --- CONTROL DE FACTURACIÓN (Hijo -> Padre) ---
  alSolicitarFactura(pedido: PedidoHistorico): void {
    if (pedido.estado !== 'pagado' && pedido.estado !== 'Entregado') {
      this.mostrarAlertaError('Solo se pueden facturar pedidos entregados.');
      return;
    }
    const facturaExistente = this.listaFacturas.find(f => f.pedidoId === pedido.id && f.estado === 'Emitida');
    if (facturaExistente) {
      this.mostrarAlertaError(`El pedido ya cuenta con la factura activa ${facturaExistente.id}.`);
      return;
    }
    this.pedidoParaFacturar = pedido;
    this.servicioPedidos.pedidoParaFacturar.set(pedido);
    this.seccionActiva = 'facturacion';
  }

  alEmitirFactura(datos: { rfc: string, razonSocial: string, usoCfdi: string }): void {
    if (!this.pedidoParaFacturar) return;

    const folio = 'FAC-' + Math.floor(1000 + Math.random() * 9000);
    this.listaFacturas.unshift({
      id: folio,
      fechaHora: new Date().toLocaleString('es-MX', { hour12: false }).substring(0, 17),
      pedidoId: this.pedidoParaFacturar.id,
      rfc: datos.rfc,
      razonSocial: datos.razonSocial,
      usoCfdi: datos.usoCfdi,
      total: this.pedidoParaFacturar.total,
      estado: 'Emitida'
    });
    this.mostrarAlertaExito(`Factura ${folio} emitida.`);
    this.pedidoParaFacturar = null;
  }

  alCancelarFactura(facturaId: string): void {
    const factura = this.listaFacturas.find(f => f.id === facturaId);
    if (factura) {
      factura.estado = 'Cancelada';
      this.mostrarAlertaExito(`Factura ${facturaId} cancelada exitosamente.`);
    }
  }

  alCancelarSeleccionFactura(): void {
    this.pedidoParaFacturar = null;
  }

  // --- CONTROL DE REPORTES (Hijo -> Padre) ---
  alExportarReporte(evento: { formato: 'PDF' | 'EXCEL', tipo: string }): void {
    this.mostrarAlertaExito(`Reporte de ${evento.tipo} exportado como ${evento.formato}.`);
  }
}
