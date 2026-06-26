import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../core/models/producto.model';
import { ItemCarrito } from '../../core/models/carrito.model';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService, PedidoHistorico } from '../../core/services/pedido.service';
import { ProductosService } from '../../core/services/productos.service';

import { GeneradorDocumentosService } from '../../core/services/generador-documentos.service';
import { AlertasService } from '../../core/services/alertas.service';

/**
 * Componente: ClienteComponent
 * Intención: Representa el panel principal para el rol de Cliente. Permite explorar el menú de productos,
 *            buscar en tiempo real, filtrar por categorías, gestionar un carrito de compras interactivo
 *            y realizar el seguimiento de un pedido activo.
 */
@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente.component.html'
})
export class ClienteComponent implements OnInit, OnDestroy {
  
  /** Catálogo completo de productos disponibles */
  listaProductos = signal<Producto[]>([]);

  /** Filtro de categoría seleccionado ('todas', 'pizza', 'bebida', 'postre') */
  categoriaSeleccionada = signal<string>('todas');

  /** Término de búsqueda escrito por el cliente */
  terminoBusqueda = signal<string>('');

  /** Página actual en el catálogo de productos */
  paginaActual = signal<number>(1);

  /** Cantidad de productos a mostrar por página */
  elementosPorPagina = signal<number>(4);

  /** Carrito de compras interactivo (vinculado al servicio global) */
  carrito = computed(() => this.carritoService.carrito());

  /** Estado de visibilidad del modal del carrito */
  modalAbierto = signal<boolean>(false);

  /** Controla si el menú desplegable móvil del navbar está abierto */
  menuMovilAbierto = signal<boolean>(false);

  /** Información del pedido activo en curso delegada al servicio */
  pedidoActivo = computed(() => this.pedidoService.pedidoActivo());

  /** Estado de visibilidad del modal de historial de pedidos */
  modalHistorialAbierto = signal<boolean>(false);

  /** Pedido seleccionado del historial para ver su desglose */
  pedidoSeleccionado = signal<PedidoHistorico | null>(null);

  /** Historial completo de pedidos del cliente */
  historialPedidos = computed(() => this.pedidoService.historialPedidos());

  /** Signal para controlar la animación de carga al enviar/reenviar correos de confirmación */
  enviandoCorreo = signal<boolean>(false);

  /**
   * Constructor del componente cliente.
   * Intención: Inyectar dependencias de servicios y rutas.
   * Parámetros:
   *   - router (Router): Servicio de enrutamiento de Angular.
   *   - autenticacionService (AutenticacionService): Servicio de sesión.
   *   - carritoService (CarritoService): Servicio del carrito de compras.
   *   - pedidoService (PedidoService): Servicio para la gestión de pedidos activos.
   *   - productosService (ProductosService): Servicio para consultar productos del backend.
   *   - generadorDocumentos (GeneradorDocumentosService): Servicio para exportar PDF/XML.
   */
  constructor(
    private router: Router,
    public autenticacionService: AutenticacionService,
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private productosService: ProductosService,
    private generadorDocumentos: GeneradorDocumentosService,
    private alertasService: AlertasService
  ) {}

  /** Referencia al intervalo de sondeo (polling) del pedido activo */
  private intervaloPolling: any;

  /**
   * Intención: Inicializar el catálogo de productos al montar el componente.
   */
  ngOnInit(): void {
    this.productosService.obtenerProductos().subscribe({
      next: productos => {
        this.listaProductos.set(productos);
      }
    });
    
    // Si el usuario está autenticado y no hay un pedido activo aún, cargar el historial real de compras
    if (this.autenticacionService.estaAutenticado()) {
      const idCliente = this.autenticacionService.idClienteActual();
      if (idCliente) {
        this.pedidoService.cargarHistorial(idCliente);
      }
    }

    this.iniciarPollingPedidoActivo();
  }

  /**
   * Intención: Limpiar recursos al destruir el componente.
   */
  ngOnDestroy(): void {
    this.detenerPollingPedidoActivo();
  }

  /**
   * Intención: Inicializar un temporizador de sondeo que consulta al backend cada 5 segundos si existe un pedido activo.
   */
  private iniciarPollingPedidoActivo(): void {
    this.intervaloPolling = setInterval(() => {
      if (this.autenticacionService.estaAutenticado()) {
        const idCliente = this.autenticacionService.idClienteActual();
        if (idCliente && this.pedidoService.pedidoActivo()) {
          this.pedidoService.actualizarPedidoActivo(idCliente);
        }
      }
    }, 5000);
  }

  /**
   * Intención: Detener y limpiar el temporizador activo para prevenir fugas de memoria.
   */
  private detenerPollingPedidoActivo(): void {
    if (this.intervaloPolling) {
      clearInterval(this.intervaloPolling);
    }
  }



  /**
   * Intención: Filtrar reactivamente los productos por categoría y por el término de búsqueda.
   * Retorno: Producto[] - Lista de productos filtrada.
   */
  productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    const busqueda = this.terminoBusqueda().toLowerCase().trim();
    let productos = this.listaProductos();

    // Filtro por categoría
    if (categoria !== 'todas') {
      productos = productos.filter(p => p.categoria === categoria);
    }

    // Filtro por término de búsqueda
    if (busqueda !== '') {
      productos = productos.filter(
        p => p.nombre.toLowerCase().includes(busqueda) || 
             p.ingredientes.toLowerCase().includes(busqueda)
      );
    }

    return productos;
  });

  /**
   * Intención: Obtener el segmento de productos que corresponden a la página seleccionada actualmente.
   * Retorno: Producto[] - Subconjunto de productos a renderizar.
   */
  productosPaginados = computed(() => {
    const filtrados = this.productosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.elementosPorPagina();
    const fin = inicio + this.elementosPorPagina();
    return filtrados.slice(inicio, fin);
  });

  /**
   * Intención: Calcular el total de páginas de productos en base a los elementos filtrados.
   * Retorno: number - Cantidad de páginas disponibles (mínimo 1).
   */
  totalPaginasMenu = computed(() => {
    const filtrados = this.productosFiltrados();
    const paginas = Math.ceil(filtrados.length / this.elementosPorPagina());
    return paginas > 0 ? paginas : 1;
  });

  /**
   * Intención: Generar un listado numérico con las páginas disponibles.
   * Retorno: number[] - Números de página.
   */
  obtenerListaPaginasMenu = computed(() => {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginasMenu(); i++) {
      paginas.push(i);
    }
    return paginas;
  });

  /**
   * Intención: Cambiar la página de visualización del catálogo de productos.
   * Parámetros:
   *   - numeroPagina (number): El número de página destino.
   * Retorno: void.
   */
  cambiarPaginaMenu(numeroPagina: number): void {
    if (numeroPagina >= 1 && numeroPagina <= this.totalPaginasMenu()) {
      this.paginaActual.set(numeroPagina);
    }
  }

  /**
   * Intención: Actualizar el término de búsqueda de productos y reiniciar la paginación.
   * Parámetros:
   *   - termino (string): El término de búsqueda digitado.
   * Retorno: void.
   */
  actualizarBusqueda(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.paginaActual.set(1);
  }

  /**
   * Intención: Calcular la cantidad total de artículos agregados en el carrito.
   * Retorno: number - Total de productos.
   */
  totalElementosCarrito = computed(() => {
    return this.carritoService.totalElementos();
  });

  /**
   * Intención: Calcular el monto total a pagar por los artículos del carrito.
   * Retorno: number - Total en pesos mexicanos.
   */
  totalPagarCarrito = computed(() => {
    return this.carritoService.totalPagar();
  });

  /**
   * Intención: Cambiar la categoría seleccionada para filtrar los productos y reiniciar la paginación.
   * Parámetros:
   *   - categoria (string): La categoría elegida.
   * Retorno: void.
   */
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada.set(categoria);
    this.paginaActual.set(1);
  }

  /**
   * Intención: Agregar un producto al carrito de compras.
   * Parámetros:
   *   - producto (Producto): El producto a añadir.
   * Retorno: void.
   */
  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
  }

  /**
   * Intención: Incrementar en 1 la cantidad de un artículo en el carrito.
   * Parámetros:
   *   - productoId (number): ID del producto.
   * Retorno: void.
   */
  incrementarCantidad(productoId: number): void {
    this.carritoService.incrementarCantidad(productoId);
  }

  /**
   * Intención: Decrementar en 1 la cantidad de un artículo en el carrito.
   * Parámetros:
   *   - productoId (number): ID del producto.
   * Retorno: void.
   */
  decrementarCantidad(productoId: number): void {
    this.carritoService.decrementarCantidad(productoId);
  }

  /**
   * Intención: Remover un producto por completo del carrito de compras.
   * Parámetros:
   *   - productoId (number): ID del producto.
   * Retorno: void.
   */
  eliminarDelCarrito(productoId: number): void {
    this.carritoService.eliminarDelCarrito(productoId);
  }

  /**
   * Intención: Abrir el modal del carrito de compras.
   * Retorno: void.
   */
  abrirModalCarrito(): void {
    if (this.totalElementosCarrito() > 0) {
      this.modalAbierto.set(true);
    }
  }

  /**
   * Intención: Cerrar el modal del carrito de compras.
   * Retorno: void.
   */
  cerrarModalCarrito(): void {
    this.modalAbierto.set(false);
  }

  /**
   * Intención: Redirigir al flujo de procesamiento de compras.
   * Retorno: void.
   */
  realizarPedido(): void {
    if (this.carrito().length === 0) return;

    this.cerrarModalCarrito();
    this.router.navigate(['/procesar-compra']);
  }

  /**
   * Intención: Calcular de forma reactiva el importe total a pagar del pedido activo.
   * Retorno: number - Total del pedido activo.
   */
  totalPedidoActivo = computed(() => {
    return this.pedidoService.totalPedidoActivo();
  });

  /**
   * Intención: Incrementar en 1 la cantidad de un producto en el pedido activo.
   * Parámetros:
   *   - productoId (number): El identificador único del producto.
   * Retorno: void.
   */
  incrementarCantidadPedido(productoId: number): void {
    this.pedidoService.incrementarCantidad(productoId);
  }

  /**
   * Intención: Decrementar en 1 la cantidad de un producto en el pedido activo. Si llega a 0, se elimina.
   * Parámetros:
   *   - productoId (number): El identificador único del producto.
   * Retorno: void.
   */
  decrementarCantidadPedido(productoId: number): void {
    this.pedidoService.decrementarCantidad(productoId);
  }

  /**
   * Intención: Eliminar un producto del pedido activo.
   * Parámetros:
   *   - productoId (number): El identificador único del producto a remover.
   * Retorno: void.
   */
  eliminarDelPedido(productoId: number): void {
    this.pedidoService.eliminarProducto(productoId);
  }

  /**
   * Intención: Cerrar la sesión del cliente actual y limpiar el estado del pedido activo.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.pedidoService.limpiarPedidoActivo();
  }

  /**
   * Intención: Abrir el modal que contiene el historial de pedidos del cliente.
   * Retorno: void.
   */
  abrirModalHistorial(): void {
    this.modalHistorialAbierto.set(true);
  }

  /**
   * Intención: Cerrar el modal del historial de pedidos y deseleccionar cualquier pedido.
   * Retorno: void.
   */
  cerrarModalHistorial(): void {
    this.modalHistorialAbierto.set(false);
    this.pedidoSeleccionado.set(null);
  }

  /**
   * Intención: Seleccionar un pedido específico de la lista del historial para mostrar su desglose detallado.
   * Parámetros:
   *   - pedido (PedidoHistorico): El objeto de pedido seleccionado.
   * Retorno: void.
   */
  seleccionarPedido(pedido: PedidoHistorico): void {
    this.pedidoSeleccionado.set(pedido);
  }

  /**
   * Intención: Quitar la selección del pedido para volver al listado general del historial.
   * Retorno: void.
   */
  deseleccionarPedido(): void {
    this.pedidoSeleccionado.set(null);
  }

  /**
   * Intención: Descargar comprobante PDF del pedido seleccionado.
   * Parámetros:
   *   - pedido (any): Datos consolidadores del pedido.
   * Retorno: void.
   */
  descargarPedidoPDF(pedido: any): void {
    this.generadorDocumentos.descargarPedidoPDF(pedido);
  }

  /**
   * Intención: Descargar comprobante XML del pedido seleccionado.
   * Parámetros:
   *   - pedido (any): Datos consolidadores del pedido.
   * Retorno: void.
   */
  descargarPedidoXML(pedido: any): void {
    this.generadorDocumentos.descargarPedidoXML(pedido);
  }

  /**
   * Intención: Solicitar el reenvío del correo de confirmación de un pedido.
   *           Implementa protección contra doble clic mostrando un estado de carga.
   * Parámetros:
   *   - pedido (any): El pedido del cual se reenviará el correo.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si ya está enviando un correo, aborta la operación para evitar peticiones duplicadas.
   */
  reenviarCorreoPedido(pedido: any): void {
    if (!pedido || this.enviandoCorreo()) return;
    
    this.enviandoCorreo.set(true);
    
    // Simular un tiempo mínimo de procesamiento de 1.5s para la animación
    setTimeout(() => {
      this.pedidoService.reenviarCorreoPedido(pedido.id).subscribe({
        next: exito => {
          this.enviandoCorreo.set(false);
          if (exito) {
            this.alertasService.lanzarNotificacion(`¡Correo de confirmación reenviado con éxito para el pedido ${pedido.id}!`, 'aceptado');
          } else {
            this.alertasService.lanzarNotificacion(`No se pudo enviar el correo del pedido ${pedido.id}. Por favor, intenta de nuevo.`, 'error');
          }
        },
        error: () => {
          this.enviandoCorreo.set(false);
          this.alertasService.lanzarNotificacion(`No se pudo enviar el correo del pedido ${pedido.id}. Por favor, intenta de nuevo.`, 'error');
        }
      });
    }, 1500);
  }

  /**
   * Intención: Retornar una URL de imagen relacionada o de respaldo basada en el nombre o categoría.
   * Parámetros:
   *   - producto (Producto): El producto a evaluar.
   * Retorno: string - URL final de la imagen.
   * Casos límite: Si el producto es nulo, retorna imagen genérica.
   */
  obtenerImagenProducto(producto: any): string {
    if (!producto) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
    }
    if (producto.imagenUrl && producto.imagenUrl.trim() !== '' && !producto.imagenUrl.includes('broken') && producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    const nombre = (producto.nombre || '').toLowerCase();
    const categoria = (producto.categoria || '').toLowerCase();

    if (nombre.includes('pepperoni')) {
      return 'https://images.unsplash.com/photo-1628840042765-356cda07504e';
    } else if (nombre.includes('hawaiana')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38';
    } else if (nombre.includes('mexicana')) {
      return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002';
    } else if (nombre.includes('queso') || nombre.includes('cuatro')) {
      return 'https://images.unsplash.com/photo-1548365328-9f547fb0953b';
    } else if (nombre.includes('tiramis') || nombre.includes('postre') || categoria === 'postre') {
      return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9';
    } else if (categoria === 'bebida' || nombre.includes('refresco') || nombre.includes('coca') || nombre.includes('agua')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97';
    }
    
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
  }

  /**
   * Intención: Delegar al servicio la actualización del tamaño de un producto en el carrito.
   * Parámetros:
   *   - productoId (number): El identificador único del producto.
   *   - evento (any): El evento change del select en el DOM.
   * Retorno: void.
   * Casos límite: Si el evento o target son nulos, no realiza ninguna acción.
   */
  actualizarTamano(productoId: number, evento: any): void {
    if (!evento || !evento.target) return;
    const valor = evento.target.value as 'grande' | 'familiar' | 'jumbo';
    this.carritoService.actualizarTamano(productoId, valor);
  }
}
