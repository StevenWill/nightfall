import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagingList, NotificationMessage } from './messaging-ui';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeNotification = (
  overrides: Partial<NotificationMessage> = {},
): NotificationMessage => ({
  id: 'notif-1',
  senderName: 'Alice',
  preview: 'Hey, how are you?',
  sentAt: '2024-06-01T12:00:00Z',
  channel: 'in-app',
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('MessagingList', () => {
  let component: MessagingList;
  let fixture: ComponentFixture<MessagingList>;

  // JSDOM doesn't implement scrollIntoView
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingList],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── notification display ───────────────────────────────────────────────────

  describe('notification display', () => {
    it('should show empty state when no messages are provided', () => {
      fixture.componentRef.setInput('messages', []);
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector(
        '.notification-empty',
      );
      expect(emptyEl).toBeTruthy();
      expect(emptyEl.textContent).toContain('No messages');
    });

    it('should hide empty state when messages are present', () => {
      fixture.componentRef.setInput('messages', [makeNotification()]);
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector(
        '.notification-empty',
      );
      expect(emptyEl).toBeNull();
    });

    it('should render one notification-item per message', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ id: '1' }),
        makeNotification({ id: '2' }),
        makeNotification({ id: '3' }),
      ]);
      fixture.detectChanges();

      const items =
        fixture.nativeElement.querySelectorAll('.notification-item');
      expect(items).toHaveLength(3);
    });

    it('should display the sender name', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ senderName: 'Jordan Lee' }),
      ]);
      fixture.detectChanges();

      const senderEl = fixture.nativeElement.querySelector(
        '.notification-sender',
      );
      expect(senderEl.textContent.trim()).toBe('Jordan Lee');
    });

    it('should display the message preview', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ preview: 'Check out this update' }),
      ]);
      fixture.detectChanges();

      const previewEl = fixture.nativeElement.querySelector(
        '.notification-preview',
      );
      expect(previewEl.textContent.trim()).toBe('Check out this update');
    });

    it('should apply pi-envelope class for in-app channel', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ channel: 'in-app' }),
      ]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.notification-channel');
      expect(icon.classList).toContain('pi-envelope');
    });

    it('should apply pi-mobile class for sms channel', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ channel: 'sms' }),
      ]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.notification-channel');
      expect(icon.classList).toContain('pi-mobile');
    });

    it('should apply pi-bell class for push channel', () => {
      fixture.componentRef.setInput('messages', [
        makeNotification({ channel: 'push' }),
      ]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.notification-channel');
      expect(icon.classList).toContain('pi-bell');
    });
  });
});
