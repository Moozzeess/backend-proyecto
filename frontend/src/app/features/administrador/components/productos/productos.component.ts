import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoAdmin } from '../../administrador.component';

/**
 * Componente: ProductosComponent
 * Intención: Administrar el catálogo de productos (pizzas, postres y bebidas) permitiendo la adición, modificación y eliminación con un checklist interactivo.
 * Parámetros:
 *   - listaProductos: ProductoAdmin[] - Colección de productos cargada.
 *   - ingredientesLlamativos: string[] - Catálogo de ingredientes a elegir en el checklist.
 * Retorno: Instancia de ProductosComponent.
 * Casos límite:
 *   - Emite eventos al padre para guardar o eliminar a fin de mantener sincronizadas las vistas globales.
 */
@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html'
})
export class ProductosComponent {
  @Input() listaProductos: ProductoAdmin[] = [];
  @Input() ingredientesLlamativos: string[] = [];

  @Output() guardar = new EventEmitter<ProductoAdmin>();
  @Output() eliminar = new EventEmitter<number>();
  @Output() errorAlerta = new EventEmitter<string>();
  @Output() exitoAlerta = new EventEmitter<string>();

  productoSeleccionado: ProductoAdmin = this.valoresPorDefectoProducto();
  esEdicionProducto: boolean = false;
  mostrarModalProducto: boolean = false;

  private valoresPorDefectoProducto(): ProductoAdmin {
    return { id: 0, nombre: '', descripcion: '', ingredientes: [], precio: 0, categoria: 'pizza', tamano: 'mediano' };
  }

  abrirAgregarProducto(): void {
    this.productoSeleccionado = this.valoresPorDefectoProducto();
    this.esEdicionProducto = false;
    this.mostrarModalProducto = true;
  }

  abrirEditarProducto(producto: ProductoAdmin): void {
    this.productoSeleccionado = { ...producto, ingredientes: [...producto.ingredientes] };
    this.esEdicionProducto = true;
    this.mostrarModalProducto = true;
  }

  conmutarIngrediente(ingrediente: string): void {
    const indice = this.productoSeleccionado.ingredientes.indexOf(ingrediente);
    if (indice === -1) {
      this.productoSeleccionado.ingredientes.push(ingrediente);
    } else {
      this.productoSeleccionado.ingredientes.splice(indice, 1);
    }
  }

  guardarProducto(): void {
    if (!this.productoSeleccionado.nombre.trim() || !this.productoSeleccionado.descripcion.trim() || this.productoSeleccionado.precio <= 0) {
      this.errorAlerta.emit('Por favor complete el nombre, descripción breve y precio mayor a $0.');
      return;
    }
    this.guardar.emit(this.productoSeleccionado);
    this.mostrarModalProducto = false;
  }

  eliminarProducto(productoId: number): void {
    this.eliminar.emit(productoId);
  }
}
