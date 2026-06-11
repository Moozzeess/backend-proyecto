import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para representar cada uno de los elementos de datos de la gráfica.
 */
export interface DatoGrafica {
  /** Etiqueta descriptiva del dato (por ejemplo, el nombre de un día o un producto). */
  etiqueta: string;
  /** Valor numérico asociado que define la magnitud. */
  valor: number;
}

/**
 * Componente: GraficaComponent
 * Intención: Presentar información estadística en forma de gráfica de barras estéticas, responsivas y animadas.
 * Parámetros:
 *   - titulo: Cadena de texto que indica el título del reporte gráfico.
 *   - datos: Arreglo de elementos que contienen la etiqueta y el valor a representar.
 *   - unidad: Cadena de texto para denotar la unidad de medida (ej. '$' o 'pizzas').
 *   - esMoneda: Booleano que indica si el formato debe anteponer el signo de pesos.
 * Retorno: Instancia del componente GraficaComponent.
 * Casos límite:
 *   - Si el arreglo de datos está vacío, se muestra un mensaje informativo y las barras no se renderizan.
 *   - Si el valor máximo acumulado es cero, se previene la división por cero asignando altura nula.
 */
@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafica.component.html'
})
export class GraficaComponent {
  /** Título descriptivo de la gráfica */
  @Input() titulo: string = 'Gráfica de Rendimiento';
  
  /** Lista de datos a graficar */
  @Input() datos: DatoGrafica[] = [];
  
  /** Símbolo de unidad (ej. 'unidades', 'pedidos') */
  @Input() unidad: string = '';

  /** Indica si se debe mostrar el símbolo de pesos al principio del valor */
  @Input() esMoneda: boolean = false;

  /**
   * Intención: Calcular el valor máximo dentro de la lista de datos para establecer la escala proporcional.
   * Retorno: number - El valor máximo o 1 si no hay datos o el máximo es 0.
   */
  obtenerValorMaximo(): number {
    if (!this.datos || this.datos.length === 0) {
      return 1;
    }
    const maximo = Math.max(...this.datos.map(d => d.valor));
    return maximo > 0 ? maximo : 1;
  }

  /**
   * Intención: Calcular la altura porcentual correspondiente a una barra de datos en base al valor máximo.
   * Parámetros:
   *   - valor (number): El valor numérico de la barra actual.
   * Retorno: string - Porcentaje formateado para su uso en estilos CSS de altura (ej. '75%').
   */
  obtenerAlturaPorcentual(valor: number): string {
    const maximo = this.obtenerValorMaximo();
    const porcentaje = (valor / maximo) * 100;
    return `${porcentaje}%`;
  }
}
