import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagingFeature } from './messaging-feature';
import {
  FcmService,
  FcmServiceMock,
  MessagingMessage,
} from '@nightfall/shared/data-access-firebase';
import { MessagingService } from '@nightfall/messaging/data-access';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeMessagingFcmMsg = (
  overrides: Partial<MessagingMessage> = {},
): MessagingMessage => ({
  topicId: 'messaging',
  sentAt: '2024-06-01T10:00:00Z',
  senderId: 'user-1',
  senderName: 'Alice',
  preview: 'Test notification',
  threadId: 'thread-1',
  channel: 'in-app',
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('MessagingFeature', () => {
  let component: MessagingFeature;
  let fixture: ComponentFixture<MessagingFeature>;
  let messagingService: MessagingService;
  let fcmMock: FcmServiceMock;

  // JSDOM doesn't implement scrollIntoView
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingFeature],
      providers: [
        MessagingService,
        { provide: FcmService, useClass: FcmServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingFeature);
    component = fixture.componentInstance;
    messagingService = TestBed.inject(MessagingService);
    fcmMock = TestBed.inject(FcmService) as unknown as FcmServiceMock;
  });

  afterEach(() => fcmMock.reset());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call messaging.initialize() during ngOnInit', () => {
    const initSpy = jest.spyOn(messagingService, 'initialize');
    fixture.detectChanges(); // triggers ngOnInit
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('should register the messaging topic after initialization', () => {
    fixture.detectChanges();
    expect(fcmMock.getTopics().get('messaging')?.active).toBe(true);
  });

  it('should render a notification item when a message arrives', () => {
    fixture.detectChanges();

    // Capture seed-data baseline before sending a new FCM message.
    const seedCount =
      fixture.nativeElement.querySelectorAll('.notification-item').length;

    fcmMock.simulateMessage(
      makeMessagingFcmMsg({
        senderName: 'Alice',
        preview: 'Test notification',
      }),
    );
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items).toHaveLength(seedCount + 1);
    expect(fixture.nativeElement.textContent).toContain('Alice');
    expect(fixture.nativeElement.textContent).toContain('Test notification');
  });

  it('should accumulate multiple notifications in the template', () => {
    fixture.detectChanges();

    // Capture seed-data baseline before sending new FCM messages.
    const seedCount =
      fixture.nativeElement.querySelectorAll('.notification-item').length;

    fcmMock.simulateMessage(
      makeMessagingFcmMsg({ preview: 'First notification', threadId: 't-1' }),
    );
    fcmMock.simulateMessage(
      makeMessagingFcmMsg({
        senderName: 'Bob',
        preview: 'Second notification',
        threadId: 't-2',
        channel: 'push',
      }),
    );
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items).toHaveLength(seedCount + 2);
  });
});
