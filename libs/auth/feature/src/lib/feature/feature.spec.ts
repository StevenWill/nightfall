import { ComponentFixture, TestBed } from '@angular/core/types/testing';
import { Feature } from './feature';

describe('Feature', () => {
  let component: Feature;
  let fixture: ComponentFixture<Feature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feature],
    }).compileComponents();

    fixture = TestBed.createComponent(Feature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
