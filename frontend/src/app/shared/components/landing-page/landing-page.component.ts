import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Componente que representa la página de aterrizaje (Landing Page).
 * Intención: Mostrar la presentación del negocio (pizzería), el menú de especialidades y las ofertas disponibles.
 * Casos límite:
 *   - Si no hay conexión al backend, muestra datos mockeados o un mensaje de error controlado.
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {
  /**
   * Lista de pizzas destacadas del menú
   */
  pizzasDestacadas = [
    {
      nombre: 'Pepperoni Supreme',
      descripcion: 'Pepperoni extra y queso mozzarella premium.',
      precio: 249,
      imagenUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'
    },
    {
      nombre: 'Hawaiana',
      descripcion: 'Piña dulce y jamón premium.',
      precio: 219,
      imagenUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65'
    },
    {
      nombre: 'Mexicana',
      descripcion: 'Chorizo, jalapeño y cebolla caramelizada.',
      precio: 259,
      imagenUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'
    },
    {
      nombre: 'Cuatro Quesos',
      descripcion: 'Mezcla premium de quesos italianos.',
      precio: 289,
      imagenUrl: 'https://images.unsplash.com/photo-1548365328-9f547fb0953b'
    }
  ];
}
