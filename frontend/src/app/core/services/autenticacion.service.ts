import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

/**
 * Servicio: AutenticacionService
 * Intención: Gestionar de manera centralizada la sesión activa de un usuario de forma simulada en el frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  /** Signal reactivo que almacena la información del usuario autenticado actualmente, o null si es anónimo. */
  usuarioActual = signal<Usuario | null>(null);

  /** Almacena temporalmente en memoria los usuarios registrados y sus contraseñas. */
  private usuariosRegistrados = new Map<string, { usuario: Usuario; contrasenia: string }>();

  /**
   * Intención: Iniciar sesión de forma simulada validando las credenciales especificadas.
   * Parámetros:
   *   - correo (string): Correo del usuario.
   *   - contrasenia (string): Contraseña de acceso.
   * Retorno: boolean - true si las credenciales coinciden con algún usuario registrado y se inicia la sesión, false de lo contrario.
   * Casos límite:
   *   - Si el correo o la contraseña están vacíos, retorna false.
   */
  iniciarSesion(correo: string, contrasenia: string): boolean {
    if (!correo || !contrasenia) {
      return false;
    }

    const emailNormalizado = correo.trim().toLowerCase();

    // Credenciales de Cliente por defecto
    if (emailNormalizado === 'cliente@pizza.com' && contrasenia === '123456') {
      this.usuarioActual.set({
        id: 1,
        nombre: 'Cliente de Prueba',
        correo: 'cliente@pizza.com',
        rol: 'cliente'
      });
      return true;
    }

    // Credenciales de Empleado por defecto
    if (emailNormalizado === 'empleado@pizza.com' && contrasenia === '123456') {
      this.usuarioActual.set({
        id: 2,
        nombre: 'Empleado de Prueba',
        correo: 'empleado@pizza.com',
        rol: 'empleado'
      });
      return true;
    }

    // Credenciales de Administrador por defecto
    if (emailNormalizado === 'admin@pizza.com' && contrasenia === '123456') {
      this.usuarioActual.set({
        id: 3,
        nombre: 'Administrador de Prueba',
        correo: 'admin@pizza.com',
        rol: 'admin'
      });
      return true;
    }

    // Validar contra usuarios creados dinámicamente
    const registroFicticio = this.usuariosRegistrados.get(emailNormalizado);
    if (registroFicticio && registroFicticio.contrasenia === contrasenia) {
      this.usuarioActual.set(registroFicticio.usuario);
      return true;
    }

    return false;
  }

  /**
   * Intención: Registrar un nuevo usuario con rol de cliente de manera simulada en memoria.
   * Parámetros:
   *   - nombre (string): Nombre completo del nuevo cliente.
   *   - correo (string): Dirección de correo electrónico única.
   *   - contrasenia (string): Contraseña secreta elegida.
   * Retorno: boolean - true si el registro fue exitoso, false si el correo ya existe o algún campo es inválido.
   * Casos límite:
   *   - Si el correo ya está registrado por defecto o dinámicamente, retorna false.
   */
  registrar(nombre: string, correo: string, contrasenia: string): boolean {
    if (!nombre || !correo || !contrasenia) {
      return false;
    }

    const emailNormalizado = correo.trim().toLowerCase();

    // Verificar si el correo ya está ocupado por credenciales por defecto o previas
    const correoOcupado = 
      emailNormalizado === 'cliente@pizza.com' ||
      emailNormalizado === 'empleado@pizza.com' ||
      emailNormalizado === 'admin@pizza.com' ||
      this.usuariosRegistrados.has(emailNormalizado);

    if (correoOcupado) {
      return false;
    }

    const nuevoUsuario: Usuario = {
      id: Math.floor(1000 + Math.random() * 9000),
      nombre: nombre.trim(),
      correo: emailNormalizado,
      rol: 'cliente' // Por defecto el rol es de cliente
    };

    this.usuariosRegistrados.set(emailNormalizado, {
      usuario: nuevoUsuario,
      contrasenia: contrasenia
    });

    return true;
  }

  /**
   * Intención: Finalizar la sesión actual del usuario, limpiando el estado.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Ninguno.
   */
  cerrarSesion(): void {
    this.usuarioActual.set(null);
  }

  /**
   * Intención: Verificar si existe un usuario autenticado en el sistema.
   * Parámetros: Ninguno.
   * Retorno: boolean - true si hay un usuario autenticado, false de lo contrario.
   * Casos límite: Ninguno.
   */
  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }
}
