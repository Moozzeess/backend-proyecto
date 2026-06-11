/**
 * Interfaz que representa el modelo de datos de un Producto del menú.
 * Intención: Definir la estructura estricta de un producto (pizza, bebida, postre) para el menú interactivo.
 * Casos límite:
 *   - El precio debe ser un número positivo.
 *   - El tamaño es opcional o aplicable solo a ciertos productos (como pizzas o bebidas de determinado tamaño).
 *   - La imagenUrl debe ser una ruta válida o una cadena vacía.
 */
export interface Producto {
  /** Identificador único del producto */
  id: number;

  /** Nombre comercial del producto */
  nombre: string;

  /** Lista de ingredientes que componen el producto */
  ingredientes: string;

  /** Precio de venta en pesos mexicanos (MXN) */
  precio: number;

  /** Categoría del producto: pizza, bebida o postre */
  categoria: 'pizza' | 'bebida' | 'postre';

  /** Tamaño específico aplicable al producto (jumbo, familiar, gigante) */
  tamano: 'jumbo' | 'familiar' | 'gigante' | 'individual' | 'no aplica';

  /** URL o ruta relativa de la imagen representativa del producto */
  imagenUrl: string;
}
