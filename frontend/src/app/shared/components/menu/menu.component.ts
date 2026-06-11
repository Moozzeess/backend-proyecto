import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/producto.model';

/**
 * Componente que gestiona la vista exclusiva del menú de pizzas, bebidas y postres.
 * Intención: Proveer una interfaz interactiva en forma de tabla con filtros y paginación para visualizar el catálogo de productos.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {

  /** Lista completa de productos cargados en el menú */
  listaProductos = signal<Producto[]>([]);

  /** Filtro de categoría actualmente seleccionado: 'todas', 'pizza', 'bebida', 'postre' */
  categoriaSeleccionada = signal<string>('todas');

  /** Página actual de la paginación */
  paginaActual = signal<number>(1);

  /** Cantidad de productos a mostrar por página */
  elementosPorPagina = signal<number>(55); // Ajustable según necesidad de visualización

  /**
   * Intención: Constructor por defecto del componente.
   */
  constructor() { }

  /**
   * Intención: Inicializar el componente con datos mock de pizzas, bebidas y postres de calidad premium.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: Si la carga inicial de datos fallara, el estado de listaProductos quedaría vacío.
   */
  ngOnInit(): void {
    this.elementosPorPagina.set(5); // Mostramos de 5 en 5 para lucir la paginación de forma interactiva
    this.cargarMenuFicticio();
  }

  /**
   * Intención: Cargar una lista inicial de productos con imágenes reales de alta calidad y datos detallados.
   * Parámetros: Ninguno.
   * Retorno: void.
   * Casos límite: N/A.
   */
  private cargarMenuFicticio(): void {
    const productosIniciales: Producto[] = [
      {
        id: 1,
        nombre: 'Pizza Margherita Suprema',
        ingredientes: 'Salsa de tomate cherry San Marzano, mozzarella de búfala fresca, albahaca fresca, aceite de oliva virgen extra',
        precio: 289,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 2,
        nombre: 'Pizza Pepperoni Especial',
        ingredientes: 'Salsa de la casa, doble mozzarella, pepperoni artesanal curado, orégano silvestre, toque de miel picante',
        precio: 319,
        categoria: 'pizza',
        tamano: 'gigante',
        imagenUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 3,
        nombre: 'Pizza Cuatro Quesos Gourmet',
        ingredientes: 'Base blanca, mozzarella, queso azul gorgonzola, parmesano reggiano de 24 meses, queso de cabra y nueces caramelizadas',
        precio: 349,
        categoria: 'pizza',
        tamano: 'jumbo',
        imagenUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 4,
        nombre: 'Pizza Vegetariana de la Huerta',
        ingredientes: 'Pimientos asados, calabacín, alcachofas, aceitunas kalamata, cebolla morada, pesto de albahaca',
        precio: 279,
        categoria: 'pizza',
        tamano: 'familiar',
        imagenUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 5,
        nombre: 'Cerveza Artesanal Porter',
        ingredientes: 'Agua de manantial, maltas tostadas, lúpulos seleccionados, notas de cacao y café',
        precio: 85,
        categoria: 'bebida',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 6,
        nombre: 'Refresco Italiano de Limón y Albahaca',
        ingredientes: 'Extracto de limones de Sicilia, infusión de albahaca fresca, agua carbonatada premium',
        precio: 55,
        categoria: 'bebida',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 7,
        nombre: 'Tiramisú Tradicional de Caffè',
        ingredientes: 'Bizcochos de soletilla bañados en espresso premium y licor Amaretto, crema de mascarpone artesanal, cacao en polvo belga',
        precio: 125,
        categoria: 'postre',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 8,
        nombre: 'Panna Cotta con Frutos del Bosque',
        ingredientes: 'Crema de vainilla de Papantla infusionada, coulis de frambuesas y zarzamoras frescas',
        precio: 110,
        categoria: 'postre',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 9,
        nombre: 'Vino Tinto Chianti Classico',
        ingredientes: 'Uvas Sangiovese cultivadas en la región de Toscana, madurado en barrica de roble francés',
        precio: 180,
        categoria: 'bebida',
        tamano: 'individual',
        imagenUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 10,
        nombre: 'Pizza Suprema de Carnes Frías',
        ingredientes: 'Jamón serrano crujiente, salami milano, salchicha italiana artesanal, base pomodoro y mozzarella',
        precio: 359,
        categoria: 'pizza',
        tamano: 'gigante',
        imagenUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
      }
    ];

    this.listaProductos.set(productosIniciales);
  }

  /**
   * Intención: Obtener la lista de productos filtrada por la categoría actualmente seleccionada.
   * Parámetros: Ninguno (utiliza Signals reactivos).
   * Retorno: Producto[] - Lista filtrada de productos.
   * Casos límite: Si no hay productos que coincidan, retorna un array vacío.
   */
  productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    const productos = this.listaProductos();

    if (categoria === 'todas') {
      return productos;
    }
    return productos.filter(p => p.categoria === categoria);
  });

  /**
   * Intención: Obtener los productos que pertenecen a la página actual seleccionada.
   * Parámetros: Ninguno (calcula en base a productosFiltrados, paginaActual y elementosPorPagina).
   * Retorno: Producto[] - Segmento de productos para la página activa.
   * Casos límite: Si la página actual supera el rango por un cambio de filtro, retorna el último segmento disponible.
   */
  productosPaginados = computed(() => {
    const filtrados = this.productosFiltrados();
    const indexInicio = (this.paginaActual() - 1) * this.elementosPorPagina();
    const indexFin = indexInicio + this.elementosPorPagina();
    return filtrados.slice(indexInicio, indexFin);
  });

  /**
   * Intención: Calcular la cantidad total de páginas en base a los elementos filtrados.
   * Parámetros: Ninguno.
   * Retorno: number - Total de páginas disponibles (mínimo 1).
   * Casos límite: Retorna 1 si la lista de filtrados está vacía para evitar división por cero o páginas nulas.
   */
  totalPaginas = computed(() => {
    const filtrados = this.productosFiltrados();
    const paginas = Math.ceil(filtrados.length / this.elementosPorPagina());
    return paginas > 0 ? paginas : 1;
  });

  /**
   * Intención: Cambiar el filtro de categoría y reiniciar la paginación a la página 1.
   * Parámetros:
   *   - categoria (string): La categoría seleccionada ('todas', 'pizza', 'bebida', 'postre').
   * Retorno: void.
   * Casos límite: Si recibe una categoría no válida, mantendrá los productos vacíos.
   */
  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada.set(categoria);
    this.paginaActual.set(1);
  }

  /**
   * Intención: Navegar hacia una página específica del menú.
   * Parámetros:
   *   - numeroPagina (number): El número de página destino.
   * Retorno: void.
   * Casos límite:
   *   - Evita cambiar la página si el número recibido está fuera del rango de 1 a totalPaginas().
   */
  cambiarPagina(numeroPagina: number): void {
    if (numeroPagina >= 1 && numeroPagina <= this.totalPaginas()) {
      this.paginaActual.set(numeroPagina);
    }
  }

  /**
   * Intención: Generar un array de números que representa cada una de las páginas disponibles para renderizarlas en la interfaz.
   * Parámetros: Ninguno.
   * Retorno: number[] - Lista de páginas.
   * Casos límite: Retorna un array con el valor `[1]` si no hay suficientes productos.
   */
  obtenerListaPaginas = computed(() => {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas(); i++) {
      paginas.push(i);
    }
    return paginas;
  });
}
