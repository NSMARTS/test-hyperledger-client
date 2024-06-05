import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersEditComponent } from './orders-edit.component';

describe('OrdersEditComponent', () => {
  let component: OrdersEditComponent;
  let fixture: ComponentFixture<OrdersEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
