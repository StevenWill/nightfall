import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagingUi } from './messaging-ui';

describe('MessagingUi', () => {
  let component: MessagingUi;
  let fixture: ComponentFixture<MessagingUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingUi],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
