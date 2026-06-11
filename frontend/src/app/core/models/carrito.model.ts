import { Producto } from './producto.model';

/**
 * Interfaz que representa un elemento dentro del carrito de compras.
 * Intención: Almacenar la referencia al producto seleccionado y la cantidad ordenada por el cliente.
 * Casos límite:
 *   - La cantidad debe ser un número entero estrictamente mayor que cero.
 */
export interface ItemCarrito {
  /** El producto seleccionado del menú */
  producto: Producto;

  /** Cantidad solicitada de dicho producto */
  cantidad: number;
}
