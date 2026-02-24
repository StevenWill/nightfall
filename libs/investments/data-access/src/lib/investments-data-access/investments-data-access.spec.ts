import { ComponentFixture, TestBed } from '@angular/core/types/testing';
import { InvestmentsDataAccess } from './investments-data-access';

describe('InvestmentsDataAccess', () => {
  let component: InvestmentsDataAccess;
  let fixture: ComponentFixture<InvestmentsDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
