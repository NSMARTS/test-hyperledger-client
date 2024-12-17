import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../services/order/order.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-orders-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './orders-edit.component.html',
  styleUrl: './orders-edit.component.scss',
})
export class OrdersEditComponent {
  fb = inject(FormBuilder);
  orderService = inject(OrderService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  foodList: any = [
    { name: '김치찌개', value: 'kimchi_soup', price: 10000, count: 0 },
    { name: '삼겹살', value: 'pork_belly', price: 11000, count: 0 },
    { name: '피자', value: 'pizza', price: 12000, count: 0 },
    { name: '햄버거', value: 'hamburger', price: 13000, count: 0 },
  ];

  form: FormGroup = this.fb.group({
    orders: this.fb.array([]),
    totalCount: [0],
    to: ['', Validators.required],
  });

  get orders() {
    return this.form.controls['orders'] as FormArray;
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    this.orderService.getOrderById(orderId).subscribe((res: any) => {
      this.form.patchValue({
        to: res.data.to,
        totalCount: res.data.totalCount,
      });
      res.data.orders.forEach((orderItem: any) => {
        this.orders.push(
          this.fb.group({
            food: [orderItem.food, [Validators.required]],
            name: [orderItem.name, Validators.required],
            price: [orderItem.price, Validators.required],
            count: [orderItem.count, Validators.required],
          })
        );
      });
    });
  }

  addFood() {
    const foodForm = this.fb.group({
      food: new FormControl(this.foodList[0].value, [Validators.required]),
      name: new FormControl(this.foodList[0].name, Validators.required),
      price: new FormControl(this.foodList[0].price, Validators.required),
      count: new FormControl(this.foodList[0].count, Validators.required),
    });
    this.orders.push(foodForm);
    this.updateTotalCount();
  }

  deleteFood(index: number) {
    this.orders.removeAt(index);
    this.updateTotalCount();
  }

  onFoodSelect(event: any, index: number) {
    const selectedFood = this.foodList.find(
      (food: any) => food.value === event.value
    );
    if (selectedFood) {
      const foodFormGroup = this.orders.at(index) as FormGroup;
      foodFormGroup.patchValue({
        name: selectedFood.name,
        price: selectedFood.price,
        count: selectedFood.count,
      });
      this.updateTotalCount();
    }
  }

  increaseCount(index: number) {
    const order = this.orders.at(index) as FormGroup;
    const currentCount = order.get('count')?.value || 0;
    order.patchValue({ count: currentCount + 1 });
    this.updateTotalCount();
  }

  decreaseCount(index: number) {
    const order = this.orders.at(index) as FormGroup;
    const currentCount = order.get('count')?.value || 0;
    if (currentCount > 0) {
      order.patchValue({ count: currentCount - 1 });
      this.updateTotalCount();
    }
  }

  updateTotalCount() {
    let total = 0;
    this.orders.controls.forEach((orderControl) => {
      const order = orderControl.value;
      total += order.price * order.count;
    });
    this.form.patchValue({ totalCount: total });
  }

  updateOrder() {
    const orderId = this.route.snapshot.paramMap.get('id');
    this.orderService.updateOrder(orderId, this.form.value).subscribe({
      next: (res: any) => {
        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }
}
