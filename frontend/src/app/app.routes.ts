import { Routes } from '@angular/router';
import { LandingPageComponent } from './shared/components/landing-page/landing-page.component';
import { LoginPageComponent } from './shared/components/login-page/login-page.component';
import { ClienteComponent } from './features/cliente/cliente.component';
import { EmpleadoComponent } from './features/empleado/empleado.component';
import { AdministradorComponent } from './features/administrador/administrador.component';
import { MenuComponent } from './shared/components/menu/menu.component';
import { ProcesarCompraComponent } from './features/procesar-compra/procesar-compra.component';
import { FacturacionComponent } from './shared/components/facturacion/facturacion.component';

/**
 * Rutas de la aplicación
 * Propósito: Define las rutas disponibles en la aplicación.
 */
export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'cliente',
    component: ClienteComponent
  },
  {
    path: 'empleado',
    component: EmpleadoComponent
  },
  {
    path: 'administrador',
    component: AdministradorComponent
  },
  {
    path: 'menu',
    component: MenuComponent
  },
  {
    path: 'procesar-compra',
    component: ProcesarCompraComponent
  },
  {
    path: 'facturacion',
    component: FacturacionComponent
  }
];

