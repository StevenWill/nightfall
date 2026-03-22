import { TestBed } from '@angular/core/testing';
import {
  FcmService,
  FcmServiceMock,
  ChatFcmMessage,
  FcmMessage,
} from '@nightfall/shared/data-access-firebase';
import { ChatService } from './chat.service';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeChatFcmMsg = (
  overrides: Partial<ChatFcmMessage> = {},
): ChatFcmMessage => ({
  topicId: 'chat',
  sentAt: '2024-06-01T10:00:00Z',
  senderId: 'user-1',
  senderName: 'Alice',
  text: 'Hello!',
  conversationId: 'conv-1',
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ChatService', () => {
  let service: ChatService;
  let fcmMock: FcmServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: FcmService, useClass: FcmServiceMock },
      ],
    });

    service = TestBed.inject(ChatService);
    fcmMock = TestBed.inject(FcmService) as unknown as FcmServiceMock;
  });

  afterEach(() => fcmMock.reset());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty messages list', (done) => {
    service.messages$.subscribe((msgs) => {
      expect(msgs).toHaveLength(0);
      done();
    });
  });

  // ── initialize() ──────────────────────────────────────────────────────────

  describe('initialize()', () => {
    it('should register the chat topic as active', () => {
      service.initialize();
      expect(fcmMock.getTopics().get('chat')?.active).toBe(true);
    });

    it('should not subscribe twice when called multiple times (idempotent)', () => {
      service.initialize();
      service.initialize();

      const msgs: unknown[][] = [];
      service.messages$.subscribe((m) => msgs.push(m));

      fcmMock.simulateMessage(makeChatFcmMsg());

      // Only one message should have been added despite two initialize() calls
      const lastState = msgs[msgs.length - 1];
      expect(lastState).toHaveLength(1);
    });
  });

  // ── incoming FCM messages ─────────────────────────────────────────────────

  describe('incoming FCM messages', () => {
    beforeEach(() => service.initialize());

    it('should map a ChatFcmMessage to a ChatMessage with isSelf=false', (done) => {
      const fcmMsg = makeChatFcmMsg({
        senderName: 'Bob',
        text: 'Hey there',
        conversationId: 'conv-42',
        sentAt: '2024-06-01T12:00:00Z',
      });

      service.messages$.subscribe((msgs) => {
        if (msgs.length === 1) {
          expect(msgs[0].senderName).toBe('Bob');
          expect(msgs[0].text).toBe('Hey there');
          expect(msgs[0].isSelf).toBe(false);
          expect(msgs[0].channel).toBe('in-app');
          expect(msgs[0].id).toBe('conv-42-2024-06-01T12:00:00Z');
          done();
        }
      });

      fcmMock.simulateMessage(fcmMsg);
    });

    it('should accumulate multiple received messages', (done) => {
      service.messages$.subscribe((msgs) => {
        if (msgs.length === 2) {
          expect(msgs[0].text).toBe('First');
          expect(msgs[1].text).toBe('Second');
          done();
        }
      });

      fcmMock.simulateMessage(
        makeChatFcmMsg({ text: 'First', conversationId: 'c-1' }),
      );
      fcmMock.simulateMessage(
        makeChatFcmMsg({ text: 'Second', conversationId: 'c-2' }),
      );
    });

    it('should ignore messages for other topics', () => {
      const received: unknown[] = [];
      service.messages$.subscribe((msgs) => {
        if (msgs.length > 0) received.push(msgs);
      });

      const otherMsg: FcmMessage = {
        topicId: 'system-alerts',
        sentAt: '2024-01-01T00:00:00Z',
        severity: 'info',
        title: 'Alert',
        body: 'Body',
      };
      fcmMock.simulateMessage(otherMsg);

      expect(received).toHaveLength(0);
    });
  });

  // ── send() ────────────────────────────────────────────────────────────────

  describe('send()', () => {
    it('should add a self message with channel "local"', (done) => {
      service.messages$.subscribe((msgs) => {
        if (msgs.length === 1) {
          expect(msgs[0].text).toBe('Hello World');
          expect(msgs[0].isSelf).toBe(true);
          expect(msgs[0].channel).toBe('local');
          expect(msgs[0].senderName).toBe('You');
          done();
        }
      });

      service.send('Hello World');
    });

    it('should trim whitespace from the text', (done) => {
      service.messages$.subscribe((msgs) => {
        if (msgs.length === 1) {
          expect(msgs[0].text).toBe('trimmed');
          done();
        }
      });

      service.send('  trimmed  ');
    });

    it('should NOT add a message when text is empty', () => {
      const received: unknown[] = [];
      service.messages$.subscribe((msgs) => {
        if (msgs.length > 0) received.push(msgs);
      });

      service.send('');
      service.send('   ');

      expect(received).toHaveLength(0);
    });
  });

  // ── ngOnDestroy() ─────────────────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('should deactivate the chat topic on destroy', () => {
      service.initialize();
      expect(fcmMock.getTopics().get('chat')?.active).toBe(true);

      service.ngOnDestroy();

      expect(fcmMock.getTopics().get('chat')?.active).toBe(false);
    });

    it('should stop receiving messages after destroy', () => {
      service.initialize();

      const received: unknown[] = [];
      service.messages$.subscribe((msgs) => {
        if (msgs.length > 0) received.push(msgs);
      });

      service.ngOnDestroy();
      fcmMock.simulateMessage(makeChatFcmMsg());

      expect(received).toHaveLength(0);
    });
  });
});
