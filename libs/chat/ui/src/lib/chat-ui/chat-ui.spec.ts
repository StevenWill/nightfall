import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatUi } from './chat-ui';

describe('ChatUi', () => {
  let component: ChatUi;
  let fixture: ComponentFixture<ChatUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUi],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
