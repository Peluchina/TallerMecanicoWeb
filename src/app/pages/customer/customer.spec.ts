import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';


describe('Customers', () => {
  let component: CustomerService;
  let fixture: ComponentFixture<CustomerService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerService],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
