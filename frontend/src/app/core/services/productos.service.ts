import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Producto } from '../models/producto.model';
import { entorno } from '../../../environments/environment';

/**
 * Servicio: ProductosService
 * Intención: Realizar peticiones HTTP para consultar el catálogo de productos disponibles en la base de datos real.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  /** Dirección base del endpoint del backend */
  private readonly apiHost = `${entorno.urlBaseApi}/productos`;

  /**
   * Constructor del servicio de productos.
   * Intención: Inyectar el cliente HTTP de Angular para hacer peticiones AJAX.
   * Parámetros:
   *   - http (HttpClient): Instancia del cliente HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Consulta todos los productos disponibles del catálogo en la base de datos.
   * Intención: Obtener y mapear la lista de pizzas, bebidas y postres de la API.
   * Parámetros: Ninguno.
   * Retorno: Observable<Producto[]> - Flujo reactivo con el listado de productos.
   */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<{ exito: boolean; datos: Producto[] }>(this.apiHost).pipe(
      map(respuesta => respuesta.datos)
    );
  }
}
