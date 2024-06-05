import { OrderService } from '../../../services/order/order.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './orders-add.component.html',
  styleUrl: './orders-add.component.scss'
})
export class OrdersAddComponent {
  fb = inject(FormBuilder)
  orderService = inject(OrderService)
  router = inject(Router)


  foodList: any = [
    {
      name: '김치찌개',
      value: 'kimchi_soup',
      price: 10000,
      count: 0
    }, {
      name: '삼겹살',
      value: 'pork_belly',
      price: 11000,
      count: 0
    }, {
      name: '피자',
      value: 'pizza',
      price: 12000,
      count: 0
    }, {
      name: '햄버거',
      value: 'hamburger',
      price: 13000,
      count: 0
    }
  ]



  form: FormGroup = this.fb.group({
    // : this.foodControl.value,
    orders: this.fb.array([]),
    totalCount: [0],
    to: ['', Validators.required]  //배송지
  })

  get orders() {
    return this.form.controls["orders"] as FormArray;
  }

  addFood() {
    const foodForm = this.fb.group({
      food: new FormControl(this.foodList[0].value, [Validators.required]),
      name: new FormControl(this.foodList[0].name, Validators.required),
      price: new FormControl(this.foodList[0].price, Validators.required),
      count: new FormControl(this.foodList[0].count, Validators.required),
    });
    this.orders.push(foodForm);
  }

  deleteFood(index: number) {
    this.orders.removeAt(index);
  }

  onFoodSelect(event: any, index: number) {
    const selectedFood = this.foodList.find((food: any) => food.value === event.value);
    if (selectedFood) {
      const foodFormGroup = this.orders.at(index) as FormGroup;
      foodFormGroup.patchValue({
        name: selectedFood.name,
        price: selectedFood.price,
        count: selectedFood.count
      });
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
    this.orders.controls.forEach(orderControl => {
      const order = orderControl.value;
      total += order.price * order.count;
    });
    this.form.patchValue({ totalCount: total });
  }

  order() {
    console.log(this.form.value)
    this.orderService.createOrder(this.form.value).subscribe({
      next: (res: any) => {
        console.log(res)
        this.router.navigate(['/orders'])
      },
      error: (err: any) => {
        console.error(err)
      }
    })
  }
}
