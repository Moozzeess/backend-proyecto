import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para la representación de los ingredientes en el inventario.
 */
export interface IngredienteCocina {
  id: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
}

/**
 * Componente: VistaInventarioComponent
 * Intención: Proporcionar a los empleados una vista interactiva del almacén de insumos para monitorear el stock y reabastecer productos críticamente bajos.
 * Parámetros:
 *   - inventario: IngredienteCocina[] - Lista de ingredientes cargada desde el estado.
 * Retorno: Instancia de VistaInventarioComponent.
 * Casos límite:
 *   - Si un ingrediente tiene stock menor o igual al stock mínimo, se marca visualmente con color rojo para denotar urgencia.
 *   - Calcula dinámicamente el porcentaje de stock en base a un valor máximo referencial de capacidad.
 */
@Component({
  selector: 'app-vista-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-inventario.component.html'
})
export class VistaInventarioComponent {
  /**
   * Lista de ingredientes del inventario.
   */
  @Input() inventario: IngredienteCocina[] = [];

  /**
   * Evento para solicitar el reabastecimiento de un ingrediente.
   */
  @Output() solicitarReabastecimiento = new EventEmitter<number>();

  /**
   * Capacidad de stock máxima estimada para el cálculo porcentual.
   */
  readonly stockMaximoReferencia: number = 100;

  /**
   * Intención: Calcular el porcentaje de capacidad actual del ingrediente.
   * Parámetros:
   *   - ingrediente: IngredienteCocina - Insumo de la cocina.
   * Retorno: number - Porcentaje de 0 a 100.
   */
  calcularPorcentaje(ingrediente: IngredienteCocina): number {
    const porcentaje = (ingrediente.stockActual / this.stockMaximoReferencia) * 100;
    return Math.min(100, Math.max(0, Math.round(porcentaje)));
  }

  /**
   * Intención: Validar si un ingrediente se encuentra en niveles críticos de stock.
   * Parámetros:
   *   - ingrediente: IngredienteCocina - Insumo a verificar.
   * Retorno: boolean - Verdadero si el stock actual es menor o igual al mínimo.
   */
  esCritico(ingrediente: IngredienteCocina): boolean {
    return ingrediente.stockActual <= ingrediente.stockMinimo;
  }

  /**
   * Intención: Emitir el evento de reabastecimiento para que el componente principal actualice el stock.
   * Parámetros:
   *   - ingredienteId (number): ID único del ingrediente.
   * Retorno: void.
   */
  reabastecer(ingredienteId: number): void {
    this.solicitarReabastecimiento.emit(ingredienteId);
  }
}
