import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, of, shareReplay, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);
  private baseUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private jwtHelper = inject(JwtHelperService);
  userInfo: WritableSignal<any | null> = signal<any | null>(null);

  constructor() {
    this.loadToken();
  }

  signUp(signUpForm: any) {
    return this.http.post(this.baseUrl + '/auth/signUp', signUpForm).pipe(
      catchError((error) => {
        console.error('Sign Up Error:', error);
        return of(null);
      })
    );
  }

  signIn(signInForm: any) {
    return this.http.post(this.baseUrl + '/auth/signIn', signInForm).pipe(
      tap((res: any) => this.setToken(res.token)),
      shareReplay(1), // 데이터 캐싱
      catchError((error) => {
        console.error('Sign In Error:', error);
        return of(null);
      })
    );
  }

  logOut(): void {
    this.removeToken();
    this.router.navigate(['/sign-in']);
  }

  removeToken(): void {
    localStorage.removeItem(environment.tokenName);
  }

  // 로그인 시 토큰 저장 함수
  setToken(token: string): void {
    this.handleToken(token);
  }

  /**
   *  주어진 토큰으로 사용자 정보를 설정하고 로컬 스토리지에 저장하는 메서드
   * */
  private handleToken(token: string | null): void {
    if (token) {
      // 토큰이 있으면 사용자 정보 및 로컬스토리지에 저장
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.userInfo.set(decodedToken);
      localStorage.setItem(environment.tokenName, token);
    } else {
      this.userInfo.set(null);
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isLoggedIn = !!token && !this.jwtHelper.isTokenExpired(token);
    if (!isLoggedIn) {
      this.logOut();
    }
    return isLoggedIn;
  }
  getToken(): string | null {
    return localStorage.getItem(environment.tokenName);
  }

  // 첫 로드나 새로고침 시 토큰이 있는지 확인 후 있으면 사용자정보 가져오는 함수
  loadToken(): void {
    const token = this.getToken();
    this.handleToken(token);
  }
}
