/**
 * Interfaz que representa el modelo de datos de una Pizza.
 * Intención: Definir la estructura estricta de una pizza para su uso en el menú y órdenes.
 * Casos límite: 
 *   - El precio debe ser un número positivo mayor a cero.
 *   - imagenUrl puede ser una cadena vacía si no hay imagen disponible.
 */
export interface Pizza {
  /** Identificador único de la pizza */
  id: number;
  
  /** Nombre comercial de la pizza */
  nombre: string;
  
  /** Descripción de los ingredientes y preparación */
  descripcion: string;
  
  /** Precio unitario en pesos mexicanos (MXN) */
  precio: number;
  
  /** URL de la imagen representativa del producto */
  imagenUrl: string;
}
