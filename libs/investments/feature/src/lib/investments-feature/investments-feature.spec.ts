import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestmentsFeature } from './investments-feature';

describe('InvestmentsFeature', () => {
  let component: InvestmentsFeature;
  let fixture: ComponentFixture<InvestmentsFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestmentsFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
