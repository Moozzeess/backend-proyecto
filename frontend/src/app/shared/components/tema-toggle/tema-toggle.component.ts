import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../../core/services/tema.service';

/**
 * Componente: TemaToggleComponent
 * Intención: Presentar un botón flotante altamente estético y animado que permita al usuario
 *            conmutar entre modo claro y modo oscuro en cualquier parte de la aplicación.
 *            Se ubica en la esquina inferior izquierda de la pantalla para evitar colisionar
 *            con el botón flotante del carrito.
 */
@Component({
  selector: 'app-tema-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tema-toggle.component.html'
})
export class TemaToggleComponent {
  /**
   * Intención: Constructor que inyecta el servicio de control de tema.
   * Parámetros:
   *   - temaService (TemaService): Servicio para gestionar el estado del modo oscuro.
   */
  constructor(public readonly temaService: TemaService) {}

  /**
   * Intención: Invocar la función de alternar tema en el servicio.
   * Parámetros: Ninguno.
   * Retorno: Ninguno.
   * Casos límite: Ninguno.
   */
  conmutarTema(): void {
    this.temaService.alternarTema();
  }
}
export default TemaToggleComponent;
