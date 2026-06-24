import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../core/services/autenticacion.service';

/**
 * Componente que representa la página de inicio de sesión (Login Page).
 * Intención: Permitir el acceso seguro al sistema por parte de clientes, empleados y administradores.
 * Casos límite:
 *   - Si los campos están vacíos, no se permite el envío del formulario.
 *   - Admite diferentes roles para la redirección post-autenticación.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit {

  /** Correo electrónico ingresado por el usuario. */
  correo = signal<string>('');

  /** Contraseña ingresada por el usuario. */
  contrasenia = signal<string>('');

  /** Nombre del usuario para el registro. */
  nombre = signal<string>('');

  /** Apellido del usuario para el registro. */
  apellido = signal<string>('');

  /** Teléfono del usuario para el registro. */
  telefono = signal<string>('');

  /** Confirmar Contraseña ingresada por el usuario en el registro. */
  confirmarContrasenia = signal<string>('');

  /** Controla si se visualiza o no la contraseña en texto plano en el formulario de login/registro. */
  verContrasenia = signal<boolean>(false);

  /** Controla si se visualiza o no la confirmación de la contraseña en el formulario de registro. */
  verConfirmarContrasenia = signal<boolean>(false);

  /** Define si el formulario se encuentra en modo registro o modo login. */
  modoRegistro = signal<boolean>(false);

  /** Ruta de redirección post-autenticación por defecto. */
  rutaRedireccion = signal<string>('/cliente');

  /** Mensaje de error a mostrar. */
  mensajeError = signal<string>('');

  /** Mensaje de éxito tras registro exitoso. */
  mensajeExito = signal<string>('');

  /**
   * Constructor del componente de inicio de sesión.
   * Intención: Inyectar dependencias de navegación y el servicio de autenticación.
   * Parámetros:
   *   - router (Router): Servicio de enrutamiento de Angular.
   *   - rutaActiva (ActivatedRoute): Información de la ruta activa.
   *   - autenticacionService (AutenticacionService): Servicio de sesión.
   */
  constructor(
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private autenticacionService: AutenticacionService
  ) { }

  /**
   * Intención: Inicializar el componente leyendo el parámetro de redirección de la URL si existe y precargar credenciales de prueba.
   * Parámetros: Ninguno.
   * Retorno: void.
   */
  ngOnInit(): void {
    this.rutaActiva.queryParams.subscribe(parametros => {
      if (parametros['redireccion']) {
        this.rutaRedireccion.set(parametros['redireccion']);
      }
    });
  }

  /**
   * Procesa la solicitud de inicio de sesión.
   * Intención: Validar credenciales con el servicio de autenticación y redirigir al panel correspondiente según su rol.
   * Retorno: void
   * Casos límite:
   *   - Si las credenciales no coinciden, muestra un mensaje de error.
   */
  iniciarSesion(): void {
    const usuario = this.correo().trim();
    const contrasenia = this.contrasenia().trim();

    if (!usuario || !contrasenia) {
      this.mensajeError.set('Por favor, introduce tu correo electrónico y contraseña.');
      return;
    }

    // Validación del formato del correo electrónico
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(usuario)) {
      this.mensajeError.set('Por favor, introduce un correo electrónico con formato válido (ejemplo@dominio.com).');
      return;
    }

    this.autenticacionService.iniciarSesion(usuario, contrasenia).subscribe(exito => {
      if (exito) {
        this.mensajeError.set('');
        const usuarioLogueado = this.autenticacionService.usuarioActual();

        if (usuarioLogueado) {
          const rol = usuarioLogueado.rol;
          if (rol === 'cliente') {
            this.router.navigateByUrl(this.rutaRedireccion());
          } else if (rol === 'empleado') {
            this.router.navigate(['/empleado']);
          } else if (rol === 'admin') {
            this.router.navigate(['/administrador']);
          }
        }
      } else {
        this.mensajeError.set('Correo electrónico o contraseña incorrectos.');
      }
    });
  }

  /**
   * Alterna entre el formulario de inicio de sesión y el de creación de cuenta.
   * Intención: Limpiar estados de error e inputs al cambiar de modo.
   * Retorno: void.
   */
  alternarModo(): void {
    this.modoRegistro.set(!this.modoRegistro());
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.nombre.set('');
    this.apellido.set('');
    this.telefono.set('');
    this.correo.set('');
    this.contrasenia.set('');
    this.confirmarContrasenia.set('');
    this.verContrasenia.set(false);
    this.verConfirmarContrasenia.set(false);
  }

  /**
   * Procesa el formulario de registro de un nuevo cliente.
   * Intención: Validar campos vacíos, coincidencia y fortaleza de contraseña, registrar al usuario y simular inicio de sesión automático.
   * Retorno: void.
   * Casos límite:
   *   - Valida longitud mínima de 8 caracteres.
   *   - Valida al menos 1 letra mayúscula, 1 minúscula, 1 número y 1 carácter especial en la contraseña.
   */
  registrarUsuario(): void {
    const nombreVal = this.nombre().trim();
    const apellidoVal = this.apellido().trim();
    const telefonoVal = this.telefono().trim();
    const correoVal = this.correo().trim();
    const contraVal = this.contrasenia().trim();
    const confirmaVal = this.confirmarContrasenia().trim();

    if (!nombreVal || !apellidoVal || !telefonoVal || !correoVal || !contraVal || !confirmaVal) {
      this.mensajeError.set('Por favor, completa todos los campos del registro.');
      return;
    }

    // Validación del formato de teléfono (10 dígitos)
    const regexTelefono = /^\d{10}$/;
    if (!regexTelefono.test(telefonoVal)) {
      this.mensajeError.set('Por favor, introduce un número de teléfono válido de 10 dígitos.');
      return;
    }

    // Validación del formato del correo electrónico
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(correoVal)) {
      this.mensajeError.set('Por favor, introduce un correo electrónico con formato válido (ejemplo@dominio.com).');
      return;
    }

    if (contraVal !== confirmaVal) {
      this.mensajeError.set('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    // Validaciones de fortaleza de la contraseña de forma conjunta
    const cumpleLongitud = contraVal.length >= 8;
    const cumpleMayuscula = /[A-Z]/.test(contraVal);
    const cumpleMinuscula = /[a-z]/.test(contraVal);
    const cumpleNumero = /\d/.test(contraVal);
    const cumpleEspecial = /[^a-zA-Z0-9]/.test(contraVal);

    if (!cumpleLongitud || !cumpleMayuscula || !cumpleMinuscula || !cumpleNumero || !cumpleEspecial) {
      this.mensajeError.set('La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial. La longitud debe ser de al menos 8 caracteres.');
      return;
    }

    this.autenticacionService.registrar(nombreVal, apellidoVal, correoVal, contraVal, telefonoVal).subscribe(registrado => {
      if (registrado) {
        this.mensajeError.set('');
        this.mensajeExito.set('¡Cuenta creada con éxito! Iniciando sesión...');

        // Iniciar sesión automático tras un breve periodo
        setTimeout(() => {
          this.autenticacionService.iniciarSesion(correoVal, contraVal).subscribe(exitoLogin => {
            if (exitoLogin) {
              this.router.navigateByUrl(this.rutaRedireccion());
            }
          });
        }, 1200);
      } else {
        this.mensajeError.set('El correo electrónico ya se encuentra registrado o hubo un error.');
      }
    });
  }
}
