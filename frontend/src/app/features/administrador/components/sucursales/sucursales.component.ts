import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucursalAdmin } from '../../administrador.component';

/**
 * Componente: SucursalesComponent
 * Intención: Presentar las sucursales con su ubicación, teléfono y ventas.
 * Parámetros:
 *   - listaSucursales: SucursalAdmin[] - Lista de sucursales.
 */
@Component({
  selector: 'app-admin-sucursales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sucursales.component.html'
})
export class SucursalesComponent {
  @Input() listaSucursales: SucursalAdmin[] = [];
}
