import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FacturaAdmin } from '../../features/administrador/administrador.component';
import { entorno } from '../../../environments/environment';

/**
 * Servicio: FacturaService
 * Intención: Proveer métodos de comunicación HTTP para la generación y gestión de facturas fiscales.
 */
@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private http = inject(HttpClient);
  private readonly apiHost = `${entorno.urlBaseApi}/facturas`;

  /**
   * Obtiene la lista completa de facturas emitidas por la pizzería.
   * Intención: Consumir la lista de facturas desde el backend real.
   * Parámetros: Ninguno.
   * Retorno: Observable<FacturaAdmin[]> - Flujo con las facturas.
   */
  obtenerFacturas(): Observable<FacturaAdmin[]> {
    return this.http.get<{ exito: boolean; datos: FacturaAdmin[] }>(this.apiHost).pipe(
      map(res => res.datos)
    );
  }

  /**
   * Emite una nueva factura para un pedido.
   * Intención: Guardar en MySQL la nueva factura del pedido.
   * Parámetros:
   *   - datos (Object): RFC, razón social, CFDI, ID del pedido y monto total.
   * Retorno: Observable<string> - El folio de la factura emitida.
   */
  emitirFactura(datos: { pedidoId: string; rfc: string; razonSocial: string; usoCfdi: string; total: number }): Observable<string> {
    return this.http.post<{ exito: boolean; datos: { folio: string } }>(`${this.apiHost}/emitir`, datos).pipe(
      map(res => res.datos.folio)
    );
  }

  /**
   * Cancela una factura emitida.
   * Intención: Anular la factura en MySQL.
   * Parámetros:
   *   - idFactura (string): Folio de la factura a cancelar.
   * Retorno: Observable<boolean> - True si la cancelación fue exitosa.
   */
  cancelarFactura(idFactura: string): Observable<boolean> {
    return this.http.patch<{ exito: boolean }>(`${this.apiHost}/${idFactura}/cancelar`, {}).pipe(
      map(res => res.exito)
    );
  }
}
