import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito } from '../models/carrito.model';
import { Producto } from '../models/producto.model';

/**
 * Servicio: CarritoService
 * Intención: Centralizar y gestionar de manera global el estado del carrito de compras.
 */
@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  /** Signal reactivo que almacena la lista de elementos en el carrito de compras. */
  carrito = signal<ItemCarrito[]>([]);

  /**
   * Intención: Calcular la cantidad total de artículos agregados en el carrito de compras.
   * Retorno: number - Total de productos acumulados.
   */
  totalElementos = computed(() => {
    return this.carrito().reduce((acumulado, item) => acumulado + item.cantidad, 0);
  });

  /**
   * Intención: Calcular el monto total a pagar por los artículos dentro del carrito.
   * Retorno: number - Total de pesos mexicanos acumulados.
   */
  totalPagar = computed(() => {
    return this.carrito().reduce((acumulado, item) => acumulado + (item.producto.precio * item.cantidad), 0);
  });

  /**
   * Intención: Agregar un producto al carrito de compras. Si ya existe, se incrementa su cantidad.
   * Parámetros:
   *   - producto (Producto): El producto a agregar.
   * Retorno: void.
   * Casos límite:
   *   - Si el producto ya se encuentra en el carrito, incrementa la cantidad en 1.
   */
  agregarProducto(producto: Producto): void {
    const items = [...this.carrito()];
    const itemExistente = items.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += 1;
      this.carrito.set(items);
    } else {
      this.carrito.set([...items, { producto, cantidad: 1 }]);
    }
  }

  /**
   * Intención: Incrementar en 1 la cantidad de un artículo en el carrito.
   * Parámetros:
   *   - productoId (number): Identificador único del producto.
   * Retorno: void.
   * Casos límite:
   *   - Si el producto no existe en el carrito, no realiza ninguna acción.
   */
  incrementarCantidad(productoId: number): void {
    const items = [...this.carrito()];
    const item = items.find(i => i.producto.id === productoId);
    if (item) {
      item.cantidad += 1;
      this.carrito.set(items);
    }
  }

  /**
   * Intención: Decrementar en 1 la cantidad de un artículo en el carrito. Si la cantidad llega a 0, se remueve.
   * Parámetros:
   *   - productoId (number): Identificador único del producto.
   * Retorno: void.
   * Casos límite:
   *   - Si la cantidad es igual a 1, llama a eliminarDelCarrito.
   */
  decrementarCantidad(productoId: number): void {
    const items = [...this.carrito()];
    const itemIndex = items.findIndex(i => i.producto.id === productoId);

    if (itemIndex > -1) {
      const item = items[itemIndex];
      if (item.cantidad > 1) {
        item.cantidad -= 1;
        this.carrito.set(items);
      } else {
        this.eliminarDelCarrito(productoId);
      }
    }
  }

  /**
   * Intención: Remover un producto por completo del carrito de compras.
   * Parámetros:
   *   - productoId (number): Identificador único del producto.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  eliminarDelCarrito(productoId: number): void {
    this.carrito.set(this.carrito().filter(item => item.producto.id !== productoId));
  }

  /**
   * Intención: Limpiar el carrito de compras por completo.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  limpiarCarrito(): void {
    this.carrito.set([]);
  }
}
