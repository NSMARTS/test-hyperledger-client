import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  constructor() {}

  getOrderById(id: any) {
    return this.http.get(this.baseUrl + '/orders/' + id);
  }

  getOrders(
    active: string,
    direction: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.get(this.baseUrl + '/orders', {
      params: { active, direction, pageIndex, pageSize },
    });
  }

  createOrder(body: any) {
    return this.http.post(this.baseUrl + '/orders', body);
  }

  updateOrder(id: string | null, body: any) {
    return this.http.patch(this.baseUrl + '/orders' + `/${id}`, body);
  }

  deleteOrder(id: string) {
    return this.http.delete(this.baseUrl + '/orders' + `/${id}`);
  }
}
