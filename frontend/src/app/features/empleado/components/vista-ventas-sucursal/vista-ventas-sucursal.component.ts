import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../../core/services/productos.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Producto } from '../../../../core/models/producto.model';
import { ItemCarrito } from '../../../../core/models/carrito.model';

/**
 * Componente: VistaVentasSucursalComponent
 * Intención: Ofrecer una interfaz a pantalla completa con diseño moderno y responsivo
 *            para que el cajero pueda atender y registrar pedidos presenciales en sucursal.
 *            Permite búsquedas rápidas, ordenación avanzada, filtros de categoría y construcción
 *            interactiva de tickets con un solo clic.
 * Parámetros: Ninguno.
 * Retorno: Instancia de VistaVentasSucursalComponent.
 * Casos límite:
 *   - Si el carrito está vacío, inhabilita la confirmación y generación de ticket.
 *   - Permite búsqueda en tiempo real sin recargar la página.
 */
@Component({
  selector: 'app-vista-ventas-sucursal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-ventas-sucursal.component.html'
})
export class VistaVentasSucursalComponent implements OnInit {
  private productosService = inject(ProductosService);
  private pedidoService = inject(PedidoService);

  /**
   * Notifica cuando el pedido es creado exitosamente en la base de datos real.
   */
  @Output() pedidoCreado = new EventEmitter<string>();

  /**
   * Lista de productos disponibles cargados de la base de datos MySQL.
   */
  productosCatalogo: Producto[] = [];

  /**
   * Carrito local del ticket presencial.
   */
  carritoLocal: ItemCarrito[] = [];

  /**
   * Filtro de búsqueda textual para los productos.
   */
  filtroBusqueda: string = '';

  /**
   * Categoría activa de filtro ('todas', 'pizza', 'bebida', 'postre').
   */
  categoriaActiva: string = 'todas';

  /**
   * Criterio de ordenación actual.
   */
  criterioOrden: 'nombre-asc' | 'precio-asc' | 'precio-desc' | 'popularidad' = 'nombre-asc';

  /**
   * Datos del cliente presencial en mostrador.
   */
  telefonoCliente: string = '5500000000';
  metodoPago: string = 'Efectivo';

  /**
   * Intención: Inicializar y cargar los productos reales.
   * Retorno: void.
   */
  ngOnInit(): void {
    this.productosService.obtenerProductos().subscribe({
      next: (prods) => {
        this.productosCatalogo = prods;
      }
    });
  }

  /**
   * Intención: Alternar la selección del producto con un clic en la fila de la tabla.
   * Parámetros:
   *   - producto (Producto): Producto a agregar o remover.
   * Retorno: void.
   */
  alternarProducto(producto: Producto): void {
    const existe = this.carritoLocal.find(item => item.producto.id === producto.id);
    if (existe) {
      this.carritoLocal = this.carritoLocal.filter(item => item.producto.id !== producto.id);
    } else {
      this.carritoLocal.push({ producto, cantidad: 1 });
    }
  }

  /**
   * Verifica si un producto está actualmente seleccionado en el carrito del cajero.
   */
  estaSeleccionado(producto: Producto): boolean {
    return this.carritoLocal.some(item => item.producto.id === producto.id);
  }

  /**
   * Modifica la cantidad del producto especificado en el ticket presencial.
   */
  modificarCantidad(productoId: number, cambio: number): void {
    const item = this.carritoLocal.find(i => i.producto.id === productoId);
    if (item) {
      item.cantidad += cambio;
      if (item.cantidad <= 0) {
        this.carritoLocal = this.carritoLocal.filter(i => i.producto.id !== productoId);
      }
    }
  }

  /**
   * Calcula el importe total del ticket en sucursal.
   */
  obtenerTotalTicket(): number {
    return this.carritoLocal.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  /**
   * Intención: Filtrar y ordenar el catálogo completo de productos basado en el input y selección del cajero.
   * Retorno: Producto[] - Catálogo procesado.
   */
  obtenerProductosFiltrados(): Producto[] {
    let prods = [...this.productosCatalogo];

    // 1. Filtro de Categoría
    if (this.categoriaActiva !== 'todas') {
      prods = prods.filter(p => p.categoria.toLowerCase() === this.categoriaActiva.toLowerCase());
    }

    // 2. Filtro de Búsqueda
    if (this.filtroBusqueda.trim()) {
      const busq = this.filtroBusqueda.toLowerCase();
      prods = prods.filter(p => p.nombre.toLowerCase().includes(busq));
    }

    // 3. Ordenamiento
    if (this.criterioOrden === 'nombre-asc') {
      prods.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (this.criterioOrden === 'precio-asc') {
      prods.sort((a, b) => a.precio - b.precio);
    } else if (this.criterioOrden === 'precio-desc') {
      prods.sort((a, b) => b.precio - a.precio);
    }

    return prods;
  }

  /**
   * Envía y registra el pedido físico en la base de datos de manera transaccional.
   */
  guardarPedido(): void {
    if (this.carritoLocal.length === 0) return;

    this.pedidoService.crearPedido(
      this.carritoLocal,
      'sucursal',
      'Consumo en Sucursal',
      this.telefonoCliente,
      this.metodoPago
    );

    this.pedidoCreado.emit('Pedido registrado con éxito en sucursal.');
    
    // Limpiar campos
    this.carritoLocal = [];
    this.telefonoCliente = '5500000000';
    this.metodoPago = 'Efectivo';
  }
}
