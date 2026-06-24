import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmpleadoAdmin } from '../../features/administrador/administrador.component';

/**
 * Servicio: EmpleadoService
 * Intención: Proveer métodos de comunicación HTTP para el CRUD de empleados del panel de administración.
 */
@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private http = inject(HttpClient);
  private readonly apiHost = 'http://localhost:3000/api/empleados';

  /**
   * Obtiene la lista completa de empleados.
   * Intención: Consumir el listado de personal desde el backend real.
   * Parámetros: Ninguno.
   * Retorno: Observable<EmpleadoAdmin[]> - Flujo con la lista de empleados.
   */
  obtenerEmpleados(): Observable<EmpleadoAdmin[]> {
    return this.http.get<{ exito: boolean; datos: EmpleadoAdmin[] }>(this.apiHost).pipe(
      map(res => res.datos)
    );
  }

  /**
   * Registra un nuevo empleado en la base de datos MySQL.
   * Intención: Crear un registro de empleado.
   * Parámetros:
   *   - empleado (EmpleadoAdmin): Datos del empleado.
   * Retorno: Observable<EmpleadoAdmin> - Datos del empleado guardado.
   */
  crearEmpleado(empleado: EmpleadoAdmin): Observable<EmpleadoAdmin> {
    return this.http.post<{ exito: boolean; datos: EmpleadoAdmin }>(this.apiHost, empleado).pipe(
      map(res => res.datos)
    );
  }

  /**
   * Actualiza los datos de un empleado.
   * Intención: Modificar puesto, sucursal, salario o nombre en la base de datos real.
   * Parámetros:
   *   - empleado (EmpleadoAdmin): Datos completos actualizados.
   * Retorno: Observable<boolean> - True si se realizó con éxito.
   */
  actualizarEmpleado(empleado: EmpleadoAdmin): Observable<boolean> {
    return this.http.put<{ exito: boolean }>(`${this.apiHost}/${empleado.id}`, empleado).pipe(
      map(res => res.exito)
    );
  }

  /**
   * Conmuta el estado de un empleado (Activo/Inactivo).
   * Intención: Habilitar o suspender temporalmente a un empleado en MySQL.
   * Parámetros:
   *   - id (number): ID único del empleado.
   * Retorno: Observable<string> - El nuevo estado asignado.
   */
  conmutarEstado(id: number): Observable<string> {
    return this.http.patch<{ exito: boolean; datos: { estado: string } }>(`${this.apiHost}/${id}/conmutar-estatus`, {}).pipe(
      map(res => res.datos.estado)
    );
  }
}
