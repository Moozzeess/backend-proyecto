import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IngredienteInventario } from '../../features/administrador/administrador.component';

/**
 * Servicio: InventarioService
 * Intención: Proveer métodos de comunicación HTTP para el control de inventario de insumos del administrador.
 */
@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private readonly apiHost = 'http://localhost:3000/api/inventario';

  /**
   * Obtiene todos los ingredientes registrados del almacén.
   * Intención: Consumir la lista de ingredientes desde el backend real.
   * Parámetros: Ninguno.
   * Retorno: Observable<IngredienteInventario[]> - Lista de ingredientes.
   */
  obtenerIngredientes(): Observable<IngredienteInventario[]> {
    return this.http.get<{ exito: boolean; datos: IngredienteInventario[] }>(this.apiHost).pipe(
      map(res => res.datos)
    );
  }

  /**
   * Reabastece un ingrediente específico.
   * Intención: Incrementar el stock de insumos en el almacén de MySQL.
   * Parámetros:
   *   - id (number): ID único del ingrediente.
   *   - cantidad (number): Cantidad a sumar.
   * Retorno: Observable<boolean> - True si la actualización fue exitosa.
   */
  reabastecerIngrediente(id: number, cantidad: number = 10): Observable<boolean> {
    return this.http.post<{ exito: boolean }>(`${this.apiHost}/${id}/reabastecer`, { cantidad }).pipe(
      map(res => res.exito)
    );
  }
}
