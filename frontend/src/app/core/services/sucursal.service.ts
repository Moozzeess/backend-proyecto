import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SucursalAdmin } from '../../features/administrador/administrador.component';

/**
 * Servicio: SucursalService
 * Intención: Proveer métodos de comunicación HTTP para el módulo de sucursales en la administración.
 */
@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private http = inject(HttpClient);
  private readonly apiHost = 'http://localhost:3000/api/sucursales';

  /**
   * Consulta todas las sucursales con cálculos en tiempo real desde el backend.
   * Intención: Listar las sucursales del negocio.
   * Parámetros: Ninguno.
   * Retorno: Observable<SucursalAdmin[]> - Flujo con la lista de sucursales.
   */
  obtenerSucursales(): Observable<SucursalAdmin[]> {
    return this.http.get<{ exito: boolean; datos: SucursalAdmin[] }>(this.apiHost).pipe(
      map(res => res.datos)
    );
  }
}
