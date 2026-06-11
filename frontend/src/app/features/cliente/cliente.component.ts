import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../core/models/producto.model';
import { ItemCarrito } from '../../core/models/carrito.model';
import { AutenticacionService } from '../../core/services/autenticacion.service';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService, PedidoHistorico } from '../../core/services/pedido.service';

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

  /** Información del pedido activo en curso delegada al servicio */
  pedidoActivo = computed(() => this.pedidoService.pedidoActivo());

  /** Estado de visibilidad del modal de historial de pedidos */
  modalHistorialAbierto = signal<boolean>(false);

  /** Pedido seleccionado del historial para ver su desglose */
  pedidoSeleccionado = signal<PedidoHistorico | null>(null);

  /** Historial completo de pedidos del cliente */
  historialPedidos = computed(() => this.pedidoService.historialPedidos());

  /**
   * Constructor del componente cliente.
   * Intención: Inyectar dependencias de servicios y rutas.
   * Parámetros:
   *   - router (Router): Servicio de enrutamiento de Angular.
   *   - autenticacionService (AutenticacionService): Servicio de sesión.
   *   - carritoService (CarritoService): Servicio del carrito de compras.
   *   - pedidoService (PedidoService): Servicio para la gestión de pedidos activos.
   */
  constructor(
    private router: Router,
    public autenticacionService: AutenticacionService,
    private carritoService: CarritoService,
    private pedidoService: PedidoService
  ) {}

  /**
   * Intención: Inicializar el catálogo de productos al montar el componente.
   */
  ngOnInit(): void {
    this.cargarProductos();
    
    // Si el usuario está autenticado y no hay un pedido activo aún, podemos simular que tiene uno previo activo
    if (this.autenticacionService.estaAutenticado() && !this.pedidoService.pedidoActivo()) {
      const productosMock = this.listaProductos();
      const itemsMock = [
        { producto: productosMock[0], cantidad: 2 }, // Pepperoni Supreme
        { producto: productosMock[4], cantidad: 3 }  // Cerveza Porter
      ];
      this.pedidoService.crearPedido(itemsMock, 'domicilio', 'Av. Insurgentes 450, C.P. 01000', '5512345678', 'efectivo');
    }
  }

  /**
   * Intención: Limpiar recursos al destruir el componente, como el temporizador de simulación.
   */
  ngOnDestroy(): void {}

  /**
   * Intención: Cargar una lista inicial de productos con imágenes ilustrativas premium.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  private cargarProductos(): void {
    const productosIniciales: Producto[] = [
      {
        id: 1,
        nombre: 'Pepperoni Supreme',
        ingredientes: 'Extra queso mozzarella premium, pepperoni artesanal curado, orégano',
        precio: 249,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 2,
        nombre: 'Mexicana Especial',
        ingredientes: 'Chorizo premium, jalapeños en rodajas, cebolla morada caramelizada y frijoles refritos',
        precio: 259,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 3,
        nombre: 'Hawaiana Suprema',
        ingredientes: 'Jamón premium en cubos, piña dulce caramelizada y doble queso mozzarella',
        precio: 229,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 4,
        nombre: 'Cuatro Quesos Italiana',
        ingredientes: 'Mozzarella de búfala, queso azul gorgonzola, parmesano reggiano de 24 meses y queso de cabra',
        precio: 289,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 5,
        nombre: 'Cerveza Artesanal Porter',
        ingredientes: 'Agua de manantial, maltas tostadas, lúpulos seleccionados, notas de cacao',
        precio: 85,
        categoria: 'bebida',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 6,
        nombre: 'Refresco Italiano Limón',
        ingredientes: 'Extracto de limones de Sicilia, agua carbonatada premium, hojas de menta',
        precio: 55,
        categoria: 'bebida',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 7,
        nombre: 'Tiramisú de la Casa',
        ingredientes: 'Bizcocho bañado en espresso y licor Amaretto, crema mascarpone, cocoa belga',
        precio: 125,
        categoria: 'postre',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 8,
        nombre: 'Panna Cotta de Vainilla',
        ingredientes: 'Crema de vainilla de Papantla, coulis de frambuesa fresca',
        precio: 110,
        categoria: 'postre',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
      }
    ];
    this.listaProductos.set(productosIniciales);
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
}
