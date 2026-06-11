import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente: CorreoComponent
 * Intención: Representar el formato y la maquetación lógica de un correo electrónico genérico
 *            enviado por el sistema, permitiendo configurar su contenido mediante entradas (inputs).
 * Parámetros:
 *   - categoria (string): Categoría del correo (ej. 'PEDIDO', 'REGISTRO').
 *   - titulo (string): Título principal del mensaje.
 *   - mensaje (string): Cuerpo del mensaje descriptivo.
 *   - tituloTarjeta (string): Título de la tarjeta de resumen interno.
 *   - referencia (string): Folio o número de referencia de la operación.
 *   - fecha (string): Fecha de la transacción o el evento.
 *   - estado (string): Estado actual del pedido o proceso.
 *   - urlAccion (string): Enlace al que redirigirá el botón de llamada a la acción (CTA).
 *   - textoAccion (string): Texto visible del botón de llamada a la acción.
 *   - mensajeAdicional (string): Nota o aclaración al pie del contenido principal.
 */
@Component({
  selector: 'app-correo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './correo.component.html'
})
export class CorreoComponent {
  /** Categoría del correo para el badge superior */
  @Input() categoria: string = '';

  /** Título principal del mensaje */
  @Input() titulo: string = '';

  /** Mensaje descriptivo del cuerpo */
  @Input() mensaje: string = '';

  /** Título de la tarjeta de datos */
  @Input() tituloTarjeta: string = '';

  /** Código de referencia o ID */
  @Input() referencia: string = '';

  /** Fecha de registro o del evento */
  @Input() fecha: string = '';

  /** Estado del pedido o cuenta */
  @Input() estado: string = '';

  /** Enlace para el botón principal */
  @Input() urlAccion: string = '';

  /** Leyenda para el botón principal */
  @Input() textoAccion: string = '';

  /** Mensaje aclaratorio adicional */
  @Input() mensajeAdicional: string = '';
}
export default CorreoComponent;
