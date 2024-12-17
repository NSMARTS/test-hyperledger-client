import { Route } from '@angular/router';
import { ContractsComponent } from './contracts.component';
import { ContractsAddComponent } from './contracts-add/contracts-add.component';
import { ContractsDetailComponent } from './contracts-detail/contracts-detail.component';
import { ContractsUpdateComponent } from './contracts-update/contracts-update.component';

export const CONTRACTS_ROUTES: Route[] = [
  {
    path: '', // 계약서 리스트
    loadComponent: () => ContractsComponent,
  },
  {
    path: 'add', // 계약서 등록페이지
    loadComponent: () => ContractsAddComponent,
  },
  {
    path: ':id', // 계약서 상세페이지
    loadComponent: () => ContractsDetailComponent,
  },
  {
    path: ':id/edit', // 계약서 수정페이지
    loadComponent: () => ContractsUpdateComponent,
  },
];
