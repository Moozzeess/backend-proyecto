/**
 * Interfaz que representa el modelo de datos de un Usuario.
 * Intención: Definir la estructura estricta del perfil de usuario y sus roles en el sistema.
 * Casos límite:
 *   - El rol debe limitarse estrictamente a 'cliente', 'empleado' o 'admin'.
 */
export interface Usuario {
  /** Identificador único del usuario */
  id: number;
  
  /** Nombre completo del usuario */
  nombre: string;
  
  /** Correo electrónico único para inicio de sesión */
  correo: string;
  
  /** Rol asignado para el control de acceso en la aplicación */
  rol: 'cliente' | 'empleado' | 'admin';

  /** Puesto laboral específico para el rol de empleado */
  puesto?: string;

  /** Teléfono de contacto del usuario */
  telefono?: string;

  /** Token JWT de sesión activa */
  token?: string;
}
