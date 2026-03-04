import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentsTable } from './investments-ui';

describe('InvestmentsTable', () => {
  let component: InvestmentsTable;
  let fixture: ComponentFixture<InvestmentsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
