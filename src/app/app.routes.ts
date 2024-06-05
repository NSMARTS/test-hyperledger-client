import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { isLoggedInGuard } from './guards/is-logged-in.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [isLoggedInGuard],
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./pages/orders/routes').then((m) => m.ORDERS_ROUTES),
      }
    ]
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/auth/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      )
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/auth/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      )
  }
];
