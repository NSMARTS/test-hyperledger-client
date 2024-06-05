import { AuthService } from './../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component, WritableSignal, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  router = inject(Router)
  authService = inject(AuthService)

  companyName: string = '';
  userInfo: WritableSignal<any | null> = this.authService.userInfo

  constructor() {
    effect(() => {
      if (this.userInfo()) {
        switch (this.userInfo().org) {
          case 'NaverMSP':
            this.companyName = '네이버 페이'
            break;
          case 'RestaurantMSP':
            this.companyName = '음식점'
            break;
          case 'DeliveryMSP':
            this.companyName = '배달업체'
            break;
          default:
            break;
        }
      }
    })
  }

  signOut() {
    this.authService.logOut()
  }
}
