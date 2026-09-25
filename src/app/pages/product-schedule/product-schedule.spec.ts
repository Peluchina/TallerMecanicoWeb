import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductScheduleComponent } from './product-schedule';

describe('ProductSchedule', () => {
  let component: ProductScheduleComponent;
  let fixture: ComponentFixture<ProductScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductScheduleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
