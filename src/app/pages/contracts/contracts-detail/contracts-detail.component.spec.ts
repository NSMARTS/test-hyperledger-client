import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsDetailComponent } from './contracts-detail.component';

describe('ContractsDetailComponent', () => {
  let component: ContractsDetailComponent;
  let fixture: ComponentFixture<ContractsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractsDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
