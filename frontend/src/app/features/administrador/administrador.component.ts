import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../core/services/autenticacion.service';

// Servicios
import { PedidoService, PedidoHistorico } from '../../core/services/pedido.service';
import { AlertasService, AlertaError } from '../../core/services/alertas.service';
import { ProductosService } from '../../core/services/productos.service';
import { EmpleadoService } from '../../core/services/empleado.service';
import { SucursalService } from '../../core/services/sucursal.service';
import { InventarioService } from '../../core/services/inventario.service';
import { FacturaService } from '../../core/services/factura.service';

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
  correo?: string;
  contrasena?: string;
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
  private autenticacionService = inject(AutenticacionService);
  private router = inject(Router);

  // Inyección de servicios del administrador
  private productosService = inject(ProductosService);
  private empleadoService = inject(EmpleadoService);
  private sucursalService = inject(SucursalService);
  private inventarioService = inject(InventarioService);
  private facturaService = inject(FacturaService);

  /**
   * Intención: Finalizar la sesión del administrador activo y redirigir al login.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  // Información del Administrador
  nombreRol: string = 'Administrador General';
  ventasHoyPesos: number = 0;
  cantidadPedidos: number = 0;
  clientesActivos: number = 0;
  ticketPromedio: number = 0;

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
    this.cargarDatosAdministrador();
  }

  /**
   * Consulta toda la información administrativa en tiempo real desde el backend.
   * Intención: Llenar colecciones de productos, sucursales, inventario, facturas y empleados.
   */
  cargarDatosAdministrador(): void {
    // Cargar KPIs del Dashboard en tiempo real
    this.servicioPedidos.obtenerKpisDiarios().subscribe({
      next: (kpis) => {
        this.ventasHoyPesos = kpis.ventasHoy;
        this.cantidadPedidos = kpis.pedidosHoy;
        this.clientesActivos = kpis.clientesActivos;
        this.ticketPromedio = kpis.ticketPromedio;
      },
      error: () => this.mostrarAlertaError('Error al cargar KPIs financieros del día.')
    });

    this.productosService.obtenerProductos().subscribe({
      next: (res: any) => {
        this.listaProductos = res.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: p.precio,
          categoria: p.categoria,
          tamano: p.tamano || 'familiar',
          ingredientes: []
        }));
      },
      error: () => this.mostrarAlertaError('Error al cargar catálogo de productos.')
    });

    this.empleadoService.obtenerEmpleados().subscribe({
      next: (datos) => this.listaEmpleados = datos,
      error: () => this.mostrarAlertaError('Error al cargar empleados.')
    });

    this.sucursalService.obtenerSucursales().subscribe({
      next: (datos) => this.listaSucursales = datos,
      error: () => this.mostrarAlertaError('Error al cargar sucursales.')
    });

    this.inventarioService.obtenerIngredientes().subscribe({
      next: (datos) => this.listaIngredientes = datos,
      error: () => this.mostrarAlertaError('Error al cargar inventario.')
    });

    this.facturaService.obtenerFacturas().subscribe({
      next: (datos) => this.listaFacturas = datos,
      error: () => this.mostrarAlertaError('Error al cargar facturas.')
    });
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
    // Almacenamiento local temporal para mantener compatibilidad en productos
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
    this.inventarioService.reabastecerIngrediente(ingredienteId, 10).subscribe({
      next: (exito) => {
        if (exito) {
          const ingrediente = this.listaIngredientes.find(i => i.id === ingredienteId);
          if (ingrediente) {
            ingrediente.stockActual += 10;
            this.mostrarAlertaExito(`Se añadieron 10 ${ingrediente.unidad} de ${ingrediente.nombre}.`);
          }
        }
      },
      error: () => this.mostrarAlertaError('No se pudo reabastecer el inventario en el backend.')
    });
  }

  // --- CONTROL DE EMPLEADOS (Hijo -> Padre) ---
  alGuardarEmpleado(empleado: EmpleadoAdmin): void {
    const indice = this.listaEmpleados.findIndex(e => e.id === empleado.id);
    if (indice !== -1) {
      this.empleadoService.actualizarEmpleado(empleado).subscribe({
        next: (exito) => {
          if (exito) {
            this.listaEmpleados[indice] = { ...empleado };
            this.mostrarAlertaExito('Datos del empleado actualizados de forma exitosa.');
          }
        },
        error: () => this.mostrarAlertaError('Error al actualizar datos en el backend.')
      });
    } else {
      this.empleadoService.crearEmpleado(empleado).subscribe({
        next: (nuevo) => {
          this.listaEmpleados.push(nuevo);
          this.mostrarAlertaExito('Nuevo empleado registrado correctamente.');
        },
        error: () => this.mostrarAlertaError('Error al registrar nuevo empleado.')
      });
    }
  }

  alConmutarEstadoEmpleado(empleadoId: number): void {
    this.empleadoService.conmutarEstado(empleadoId).subscribe({
      next: (nuevoEstado) => {
        const empleado = this.listaEmpleados.find(e => e.id === empleadoId);
        if (empleado) {
          empleado.estado = nuevoEstado as any;
          this.mostrarAlertaExito(`Estado de ${empleado.nombre} modificado a ${empleado.estado}.`);
        }
      },
      error: () => this.mostrarAlertaError('Error al conmutar estado de empleado en el backend.')
    });
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

    const payload = {
      pedidoId: this.pedidoParaFacturar.id,
      rfc: datos.rfc,
      razonSocial: datos.razonSocial,
      usoCfdi: datos.usoCfdi,
      total: this.pedidoParaFacturar.total
    };

    this.facturaService.emitirFactura(payload).subscribe({
      next: (folio) => {
        this.listaFacturas.unshift({
          id: folio,
          fechaHora: new Date().toLocaleString('es-MX', { hour12: false }).substring(0, 17),
          pedidoId: this.pedidoParaFacturar!.id,
          rfc: datos.rfc,
          razonSocial: datos.razonSocial,
          usoCfdi: datos.usoCfdi,
          total: this.pedidoParaFacturar!.total,
          estado: 'Emitida'
        });
        this.mostrarAlertaExito(`Factura ${folio} emitida.`);
        this.pedidoParaFacturar = null;
      },
      error: (err) => this.mostrarAlertaError(err.error?.mensaje || 'Error al emitir factura en el backend.')
    });
  }

  alCancelarFactura(facturaId: string): void {
    this.facturaService.cancelarFactura(facturaId).subscribe({
      next: (exito) => {
        if (exito) {
          const factura = this.listaFacturas.find(f => f.id === facturaId);
          if (factura) {
            factura.estado = 'Cancelada';
            this.mostrarAlertaExito(`Factura ${facturaId} cancelada exitosamente.`);
          }
        }
      },
      error: () => this.mostrarAlertaError('Error al cancelar factura en el backend.')
    });
  }

  alCancelarSeleccionFactura(): void {
    this.pedidoParaFacturar = null;
  }

  // --- CONTROL DE REPORTES (Hijo -> Padre) ---
  alExportarReporte(evento: { formato: 'PDF' | 'EXCEL', tipo: string }): void {
    this.mostrarAlertaExito(`Reporte de ${evento.tipo} exportado como ${evento.formato}.`);
  }
}
