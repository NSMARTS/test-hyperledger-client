import { effect, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const isLoggedInGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const routePath = route.routeConfig?.path ?? ''; // ?? 은 타입스크립트 문법으로 undefined || null 이면 ''로 주겠다.
  // const isLoggedIn = window.localStorage.getItem('isLoggedIn')
  const isLoggedIn = authService.isLoggedIn();

  if (isLoggedIn) {
    if (['sign-in', 'sign-up'].includes(routePath)) {
      router.navigate(['/']);
    }
    return true;
  }

  if (['sign-in', 'sign-up'].includes(routePath)) {
    return true;
  }

  if (routePath === '') {
    router.navigate(['sign-in']);
    return true;
  }

  alert('Please login first');
  router.navigate(['sign-in'], { queryParams: { redirectURL: state.url } });
  return false;
};
