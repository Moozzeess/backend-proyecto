import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { entorno } from '../../../environments/environment';

/**
 * Servicio: AutenticacionService
 * Intención: Gestionar la sesión activa del usuario consultando de forma asíncrona la API del backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  /** Signal reactivo que almacena la información del usuario autenticado actualmente, o null si es anónimo. */
  usuarioActual = signal<Usuario | null>(null);

  /** Almacena el idCliente asociado al usuario autenticado (si aplica) para registrar pedidos. */
  idClienteActual = signal<number | null>(null);

  /** Dirección base del endpoint del backend */
  private readonly apiHost = `${entorno.urlBaseApi}/autenticacion`;

  /**
   * Constructor de AutenticacionService.
   * Intención: Inyectar el cliente HTTP para conectar con la API.
   * Parámetros:
   *   - http (HttpClient): Instancia del cliente HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Inicia sesión del usuario validando credenciales contra la base de datos real.
   * Intención: Autenticar al usuario e hidratar su rol y sesión activa en la aplicación.
   * Parámetros:
   *   - correo (string): Correo del usuario.
   *   - contrasenia (string): Contraseña de acceso.
   * Retorno: Observable<boolean> - true si el inicio de sesión es exitoso, false de lo contrario.
   */
  iniciarSesion(correo: string, contrasenia: string): Observable<boolean> {
    if (!correo || !contrasenia) {
      return of(false);
    }

    return this.http.post<{ exito: boolean; datos: any }>(`${this.apiHost}/login`, {
      correo: correo.trim().toLowerCase(),
      contrasena: contrasenia.trim()
    }).pipe(
      map(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          const datos = respuesta.datos;
          // Normalizar rol 'administrador' de la DB a 'admin' usado en frontend
          let rolFront: 'cliente' | 'empleado' | 'admin' = 'cliente';
          if (datos.rol === 'administrador') {
            rolFront = 'admin';
          } else if (datos.rol === 'empleado') {
            rolFront = 'empleado';
          }

          const usuario: Usuario = {
            id: datos.id,
            nombre: `${datos.nombre || ''} ${datos.apellido || ''}`.trim() || datos.correo,
            correo: datos.correo,
            rol: rolFront,
            puesto: datos.puesto,
            telefono: datos.telefono
          };

          this.usuarioActual.set(usuario);
          this.idClienteActual.set(datos.idCliente || datos.idEmpleado || null);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Registra un nuevo usuario con rol de cliente en la base de datos MySQL real.
   * Intención: Insertar credenciales de usuario y datos de perfil de cliente en el sistema.
   * Parámetros:
   *   - nombre (string): Nombre del cliente.
   *   - apellido (string): Apellido del cliente.
   *   - correo (string): Dirección de correo electrónico.
   *   - contrasenia (string): Contraseña elegida.
   *   - telefono (string): Teléfono del cliente.
   * Retorno: Observable<boolean> - true si el registro fue exitoso, false si falló.
   * Casos límite (edge cases):
   *   - Si alguno de los parámetros obligatorios está vacío, retorna un Observable que emite false.
   */
  registrar(nombre: string, apellido: string, correo: string, contrasenia: string, telefono: string): Observable<boolean> {
    if (!nombre || !apellido || !correo || !contrasenia || !telefono) {
      return of(false);
    }

    return this.http.post<{ exito: boolean; datos: any }>(`${this.apiHost}/registro`, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      contrasena: contrasenia.trim(),
      telefono: telefono.trim(),
      direccion: ''
    }).pipe(
      map(respuesta => respuesta.exito),
      catchError(() => of(false))
    );
  }

  /**
   * Finaliza la sesión actual del usuario, limpiando el estado.
   * Intención: Remover credenciales de memoria.
   * Retorno: void.
   */
  cerrarSesion(): void {
    this.usuarioActual.set(null);
    this.idClienteActual.set(null);
  }

  /**
   * Verifica si existe un usuario autenticado en el sistema.
   * Retorno: boolean.
   */
  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }
}
