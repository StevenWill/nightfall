import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagingFeature } from './messaging-feature';

describe('MessagingFeature', () => {
  let component: MessagingFeature;
  let fixture: ComponentFixture<MessagingFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingFeature],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingFeature);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
