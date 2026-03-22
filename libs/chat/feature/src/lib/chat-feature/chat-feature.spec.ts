import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatFeature } from './chat-feature';
import {
  FcmService,
  FcmServiceMock,
} from '@nightfall/shared/data-access-firebase';
import { ChatService } from '@nightfall/chat/data-access';

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ChatFeature', () => {
  let component: ChatFeature;
  let fixture: ComponentFixture<ChatFeature>;
  let chatService: ChatService;
  let fcmMock: FcmServiceMock;

  // JSDOM doesn't implement scrollIntoView (used by ChatWindow)
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatFeature],
      providers: [{ provide: FcmService, useClass: FcmServiceMock }],
    }).compileComponents();

    chatService = TestBed.inject(ChatService);
    fcmMock = TestBed.inject(FcmService) as unknown as FcmServiceMock;

    fixture = TestBed.createComponent(ChatFeature);
    component = fixture.componentInstance;
  });

  afterEach(() => fcmMock.reset());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call chat.initialize() during ngOnInit', () => {
    const initSpy = jest.spyOn(chatService, 'initialize');
    fixture.detectChanges(); // triggers ngOnInit
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('should register the chat topic after initialization', () => {
    fixture.detectChanges();
    expect(fcmMock.getTopics().get('chat')?.active).toBe(true);
  });

  it('should render messages from ChatService in the template', () => {
    fixture.detectChanges();
    chatService.send('Hello from service');
    fixture.detectChanges();

    const bubbles = fixture.nativeElement.querySelectorAll('.chat-bubble');
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].textContent).toContain('Hello from service');
  });

  it('should call chat.send() when onMessageSent is triggered', () => {
    fixture.detectChanges();
    const sendSpy = jest.spyOn(chatService, 'send');

    (component as unknown as { onMessageSent(t: string): void }).onMessageSent(
      'Test message',
    );

    expect(sendSpy).toHaveBeenCalledWith('Test message');
  });

  it('should accumulate messages as more are sent', () => {
    fixture.detectChanges();
    chatService.send('First');
    chatService.send('Second');
    chatService.send('Third');
    fixture.detectChanges();

    const bubbles = fixture.nativeElement.querySelectorAll('.chat-bubble');
    expect(bubbles).toHaveLength(3);
  });
});
