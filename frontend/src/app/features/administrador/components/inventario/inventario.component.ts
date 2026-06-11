import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredienteInventario } from '../../administrador.component';

/**
 * Componente: InventarioComponent
 * Intención: Proveer visualización e incremento de stock sobre el inventario de insumos.
 * Parámetros:
 *   - listaIngredientes: IngredienteInventario[] - Lista de insumos.
 * Retorno: Instancia de InventarioComponent.
 */
@Component({
  selector: 'app-admin-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent {
  @Input() listaIngredientes: IngredienteInventario[] = [];
  @Output() reabastecer = new EventEmitter<number>();

  reabastecerIngrediente(ingredienteId: number): void {
    this.reabastecer.emit(ingredienteId);
  }
}
