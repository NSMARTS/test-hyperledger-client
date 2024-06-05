import { Route } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrdersAddComponent } from './orders-add/orders-add.component';
import { OrdersEditComponent } from './orders-edit/orders-edit.component';






export const ORDERS_ROUTES: Route[] = [
  {
    path: '', // 주문 리스트
    loadComponent: () => OrdersComponent,
  },
  {
    path: 'add', // 주문페이지
    loadComponent: () => OrdersAddComponent,
  },
  {
    path: ':id', // 상세페이지
    loadComponent: () => OrdersComponent,
  },
  {
    path: ':id/edit', // 수정페이지
    loadComponent: () => OrdersEditComponent,
  },

];
