import datosSimuladosJson from '../../../../../pruebas/datos-simulados.json';

export interface ProductoSimulado {
  id: number;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  precio: number;
  categoria: 'pizza' | 'bebida' | 'postre';
  tamano: 'individual' | 'mediano' | 'familiar' | 'no aplica';
}

/**
 * Constantes de Datos Simulados para Pizza Pizza.
 * Intención: Almacenar la información base de negocio cargando directamente desde pruebas/datos-simulados.json
 *            para no duplicar o hardcodear código en la aplicación Angular.
 */
export const PRODUCTOS_MOCK: ProductoSimulado[] = datosSimuladosJson.productos as ProductoSimulado[];
export const INGREDIENTES_MOCK: any[] = datosSimuladosJson.ingredientes;
export const EMPLEADOS_MOCK: any[] = datosSimuladosJson.empleados;
export const SUCURSALES_MOCK: any[] = datosSimuladosJson.sucursales;
export const FACTURAS_MOCK: any[] = datosSimuladosJson.facturas;
export const PEDIDOS_MOCK: any[] = datosSimuladosJson.pedidos;
export const CORTES_CAJA_MOCK: any[] = datosSimuladosJson.cortesCaja;
