import { TestBed } from '@angular/core/testing';
import {
  FcmService,
  FcmServiceMock,
  MessagingMessage,
  FcmMessage,
} from '@nightfall/shared/data-access-firebase';
import { MessagingService } from './chat.service';

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
  preview: 'Hey, how are you?',
  threadId: 'thread-1',
  channel: 'in-app',
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('MessagingService', () => {
  let service: MessagingService;
  let fcmMock: FcmServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagingService,
        { provide: FcmService, useClass: FcmServiceMock },
      ],
    });

    service = TestBed.inject(MessagingService);
    fcmMock = TestBed.inject(FcmService) as unknown as FcmServiceMock;
  });

  afterEach(() => fcmMock.reset());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty messages list before initialize()', (done) => {
    service.messages$.subscribe((msgs) => {
      expect(msgs).toHaveLength(0);
      done();
    });
  });

  // ── initialize() ──────────────────────────────────────────────────────────

  describe('initialize()', () => {
    it('should register the messaging topic as active', () => {
      service.initialize();
      expect(fcmMock.getTopics().get('messaging')?.active).toBe(true);
    });

    it('should not subscribe twice when called multiple times (idempotent)', () => {
      service.initialize();
      service.initialize(); // second call must be a no-op

      const snapshots: unknown[][] = [];
      service.messages$.subscribe((m) => snapshots.push(m));

      // At this point snapshots[0] holds the 4 seed messages (BehaviorSubject replay).
      const countAfterSeed = (snapshots[snapshots.length - 1] as unknown[])
        .length;

      fcmMock.simulateMessage(makeMessagingFcmMsg());

      // Only 1 new message should have been appended (not 2, which would indicate a double-subscription).
      const lastState = snapshots[snapshots.length - 1] as unknown[];
      expect(lastState).toHaveLength(countAfterSeed + 1);
    });
  });

  // ── incoming FCM messages ─────────────────────────────────────────────────

  describe('incoming FCM messages', () => {
    beforeEach(() => service.initialize());

    it('should map a MessagingMessage to a NotificationMessage', (done) => {
      const fcmMsg = makeMessagingFcmMsg({
        senderName: 'Bob',
        preview: 'Check out this update',
        threadId: 'thread-42',
        sentAt: '2024-06-01T12:00:00Z',
        channel: 'push',
      });

      // After initialize() the BehaviorSubject already holds 4 seed messages.
      // The new FCM message arrives as the 5th entry.
      let seedCount = 0;
      let seenSeed = false;
      service.messages$.subscribe((msgs) => {
        if (!seenSeed) {
          seedCount = msgs.length;
          seenSeed = true;
          return;
        }
        if (msgs.length === seedCount + 1) {
          const added = msgs[msgs.length - 1];
          expect(added.senderName).toBe('Bob');
          expect(added.preview).toBe('Check out this update');
          expect(added.id).toBe('thread-42');
          expect(added.sentAt).toBe('2024-06-01T12:00:00Z');
          expect(added.channel).toBe('push');
          done();
        }
      });

      fcmMock.simulateMessage(fcmMsg);
    });

    it('should accumulate multiple received messages', (done) => {
      let seedCount = 0;
      let seenSeed = false;
      service.messages$.subscribe((msgs) => {
        if (!seenSeed) {
          seedCount = msgs.length;
          seenSeed = true;
          return;
        }
        if (msgs.length === seedCount + 2) {
          expect(msgs[seedCount].preview).toBe('First message');
          expect(msgs[seedCount + 1].preview).toBe('Second message');
          done();
        }
      });

      fcmMock.simulateMessage(
        makeMessagingFcmMsg({ preview: 'First message', threadId: 't-1' }),
      );
      fcmMock.simulateMessage(
        makeMessagingFcmMsg({ preview: 'Second message', threadId: 't-2' }),
      );
    });

    it('should ignore messages for other topics', () => {
      // Capture the message count after seed data is loaded.
      let countAfterSeed = 0;
      service.messages$.subscribe((msgs) => (countAfterSeed = msgs.length));

      const otherMsg: FcmMessage = {
        topicId: 'system-alerts',
        sentAt: '2024-01-01T00:00:00Z',
        severity: 'info',
        title: 'Alert',
        body: 'Body',
      };
      fcmMock.simulateMessage(otherMsg);

      // Count must not have grown — the foreign-topic message was ignored.
      let countAfterForeign = 0;
      service.messages$.subscribe((msgs) => (countAfterForeign = msgs.length));
      expect(countAfterForeign).toBe(countAfterSeed);
    });
  });

  // ── ngOnDestroy() ─────────────────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('should deactivate the messaging topic on destroy', () => {
      service.initialize();
      expect(fcmMock.getTopics().get('messaging')?.active).toBe(true);

      service.ngOnDestroy();

      expect(fcmMock.getTopics().get('messaging')?.active).toBe(false);
    });

    it('should stop receiving messages after destroy', () => {
      service.initialize();

      // Capture baseline count (seed data already loaded by beforeEach initialize()).
      let countAtDestroy = 0;
      service.messages$.subscribe((msgs) => (countAtDestroy = msgs.length));

      service.ngOnDestroy();
      fcmMock.simulateMessage(makeMessagingFcmMsg());

      // Count must not have grown after destroy.
      let countAfterMsg = 0;
      service.messages$.subscribe((msgs) => (countAfterMsg = msgs.length));
      expect(countAfterMsg).toBe(countAtDestroy);
    });
  });
});
