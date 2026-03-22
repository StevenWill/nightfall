import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FcmService } from './fcm.service';
import { FirebaseInitService } from '../firebase-init/firebase-init.service';
import { ConfigService } from '@nightfall/shared/util';
import { FcmMessage } from '../models/fcm-message.model';
import { FcmTopic } from '../models/fcm-topic.model';

// ─────────────────────────────────────────────────────────────────────────────
// Mock firebase/messaging — no real Firebase app needed
// ─────────────────────────────────────────────────────────────────────────────
const mockOnMessageCallback: { fn?: (payload: unknown) => void } = {};

jest.mock('firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({ app: 'mock' })),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token-abc')),
  onMessage: jest.fn((_messaging: unknown, cb: (p: unknown) => void) => {
    mockOnMessageCallback.fn = cb;
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const mockApp = { name: '[DEFAULT]', options: { projectId: 'test' } } as never;

const mockTopic: FcmTopic = {
  id: 'system-alerts',
  label: 'System Alerts',
  active: true,
};

const mockSystemMsg: FcmMessage = {
  topicId: 'system-alerts',
  sentAt: '2024-01-01T00:00:00Z',
  severity: 'info',
  title: 'Test',
  body: 'Hello',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('FcmService', () => {
  let service: FcmService;
  let firebaseInitSpy: jest.Mocked<Pick<FirebaseInitService, 'initialize'>>;

  beforeEach(() => {
    firebaseInitSpy = { initialize: jest.fn(() => of(mockApp)) };

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        serviceWorker: {
          register: jest.fn(() =>
            Promise.resolve({ scope: '/' } as ServiceWorkerRegistration),
          ),
        },
      },
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        FcmService,
        { provide: FirebaseInitService, useValue: firebaseInitSpy },
        {
          provide: ConfigService,
          useValue: { get: () => ({ vapidKey: 'mock-vapid' }) },
        },
      ],
    });

    service = TestBed.inject(FcmService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── initialize ─────────────────────────────────────────────────────────────

  it('should acquire a token on initialize()', (done) => {
    service.initialize().subscribe((token) => {
      expect(token).toBe('mock-fcm-token-abc');
      done();
    });
  });

  it('should emit the token on token$', (done) => {
    service.initialize().subscribe(() => {
      service.token$.subscribe((token) => {
        expect(token).toBe('mock-fcm-token-abc');
        done();
      });
    });
  });

  // ── topic subscriptions ────────────────────────────────────────────────────

  it('should register a topic via initializeTopicSubscription()', () => {
    service.initializeTopicSubscription(mockTopic);
    expect(service.getTopics().get('system-alerts')?.active).toBe(true);
  });

  it('should deactivate a topic via removeTopicSubscription()', () => {
    service.initializeTopicSubscription(mockTopic);
    service.removeTopicSubscription('system-alerts');
    expect(service.getTopics().get('system-alerts')?.active).toBe(false);
  });

  it('should not re-register an already-registered topic', () => {
    service.initializeTopicSubscription(mockTopic);
    service.initializeTopicSubscription({ ...mockTopic, label: 'Updated' });
    // Label should remain the original since it was already registered
    expect(service.getTopics().get('system-alerts')?.label).toBe(
      'System Alerts',
    );
  });

  // ── getMessageByTopicId$ ───────────────────────────────────────────────────

  it('should emit messages only for the subscribed topic', (done) => {
    service.initializeTopicSubscription(mockTopic);

    service.getMessageByTopicId$('system-alerts').subscribe((msg) => {
      expect(msg.topicId).toBe('system-alerts');
      done();
    });

    // Push via allMessages$ — simulate foreground delivery
    (
      service as unknown as {
        _messageSubject$: { next: (m: FcmMessage) => void };
      }
    )._messageSubject$.next(mockSystemMsg);
  });

  it('should NOT emit messages for an inactive topic', () => {
    service.initializeTopicSubscription(mockTopic);
    service.removeTopicSubscription('system-alerts');

    const received: FcmMessage[] = [];
    service
      .getMessageByTopicId$('system-alerts')
      .subscribe((m) => received.push(m));

    (
      service as unknown as {
        _messageSubject$: { next: (m: FcmMessage) => void };
      }
    )._messageSubject$.next(mockSystemMsg);

    expect(received).toHaveLength(0);
  });
});
