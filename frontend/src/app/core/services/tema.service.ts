import { Injectable, signal, effect } from '@angular/core';

/**
 * Servicio: TemaService
 * Intención: Administrar el estado del tema de la aplicación (Modo Claro / Modo Oscuro) y
 *            aplicar de manera reactiva la clase CSS correspondiente al elemento raíz (HTML)
 *            para activar la paleta oscura solicitada por el usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class TemaService {
  /**
   * Signal que almacena si el modo oscuro está activo.
   * Inicializa leyendo el valor guardado en localStorage, o por defecto en falso.
   */
  readonly modoOscuroActivo = signal<boolean>(false);

  /**
   * Nombre de la clave utilizada para persistir la configuración en el almacenamiento local.
   */
  private readonly claveLocalStorage = 'pizza-pizza-tema-oscuro';

  /**
   * Intención: Constructor que configura el efecto reactivo para sincronizar el estado del signal
   *            con la clase del documento DOM y con el almacenamiento local.
   * Parámetros: Ninguno.
   * Retorno: Ninguno.
   * Casos límite: Si se ejecuta en un entorno del lado del servidor (SSR) sin acceso a 'document' o
   *               'localStorage', este bloque debe manejarse con cuidado (en este caso el proyecto corre en cliente).
   */
  constructor() {
    try {
      const temaGuardado = localStorage.getItem(this.claveLocalStorage);
      if (temaGuardado !== null) {
        this.modoOscuroActivo.set(temaGuardado === 'true');
      }
    } catch (error) {
      // Caso límite: Acceso a localStorage deshabilitado en el navegador.
      console.warn('No se pudo acceder al almacenamiento local para el tema:', error);
    }

    // Efecto reactivo para actualizar la clase del elemento HTML y localStorage
    effect(() => {
      const activo = this.modoOscuroActivo();
      try {
        localStorage.setItem(this.claveLocalStorage, activo ? 'true' : 'false');
      } catch (error) {
        console.warn('No se pudo guardar la preferencia de tema:', error);
      }

      const elementoHtml = document.documentElement;
      if (activo) {
        elementoHtml.classList.add('dark');
      } else {
        elementoHtml.classList.remove('dark');
      }
    });
  }

  /**
   * Intención: Alternar el estado actual del modo oscuro.
   * Parámetros: Ninguno.
   * Retorno: Ninguno.
   * Casos límite: Ninguno.
   */
  alternarTema(): void {
    this.modoOscuroActivo.update((activo) => !activo);
  }
}
export default TemaService;
