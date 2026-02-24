import { ComponentFixture, TestBed } from '@angular/core/types/testing';
import { InvestmentsUi } from './investments-ui';

describe('InvestmentsUi', () => {
  let component: InvestmentsUi;
  let fixture: ComponentFixture<InvestmentsUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsUi],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
