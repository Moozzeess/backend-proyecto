import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente: ConfiguracionComponent
 * Intención: Administrar los parámetros globales del negocio como moneda, IVA y dirección fiscal.
 * Parámetros:
 *   - configuracionNegocio: Objeto con los datos de configuración.
 */
@Component({
  selector: 'app-admin-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent {
  @Input() configuracionNegocio: any = {};
  @Output() guardar = new EventEmitter<void>();

  guardarConfiguracion(): void {
    this.guardar.emit();
  }
}
