import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChatWindow, ChatMessage } from './chat-window';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  senderName: 'Alice',
  text: 'Hello!',
  sentAt: '2024-06-01T12:00:00Z',
  isSelf: false,
  channel: 'in-app',
  ...overrides,
});

/** Sets the draft signal via the protected accessor. */
function setDraft(component: ChatWindow, text: string): void {
  (component as unknown as { draft: { set(v: string): void } }).draft.set(text);
}

/** Calls the protected send() method. */
function triggerSend(component: ChatWindow): void {
  (component as unknown as { send(): void }).send();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ChatWindow', () => {
  let component: ChatWindow;
  let fixture: ComponentFixture<ChatWindow>;

  // JSDOM doesn't implement scrollIntoView
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── message display ────────────────────────────────────────────────────────

  describe('message display', () => {
    it('should show empty state when no messages are provided', () => {
      fixture.componentRef.setInput('messages', []);
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector('.chat-empty');
      expect(emptyEl).toBeTruthy();
      expect(emptyEl.textContent).toContain('No messages');
    });

    it('should hide empty state when messages are present', () => {
      fixture.componentRef.setInput('messages', [makeMessage()]);
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector('.chat-empty');
      expect(emptyEl).toBeNull();
    });

    it('should render one bubble per message', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ id: '1', text: 'First' }),
        makeMessage({ id: '2', text: 'Second' }),
      ]);
      fixture.detectChanges();

      const bubbles = fixture.nativeElement.querySelectorAll('.chat-bubble');
      expect(bubbles).toHaveLength(2);
    });

    it('should display message text in each bubble', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ id: '1', text: 'Unique text content' }),
      ]);
      fixture.detectChanges();

      const textEl = fixture.nativeElement.querySelector('.chat-text');
      expect(textEl.textContent.trim()).toBe('Unique text content');
    });

    it('should apply "self" class to own messages', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ isSelf: true }),
      ]);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.chat-bubble-row');
      const bubble = fixture.nativeElement.querySelector('.chat-bubble');
      expect(row.classList).toContain('self');
      expect(bubble.classList).toContain('self');
    });

    it('should NOT apply "self" class to received messages', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ isSelf: false }),
      ]);
      fixture.detectChanges();

      const row = fixture.nativeElement.querySelector('.chat-bubble-row');
      expect(row.classList).not.toContain('self');
    });

    it('should show sender name for received messages', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ senderName: 'Alice', isSelf: false }),
      ]);
      fixture.detectChanges();

      const senderEl = fixture.nativeElement.querySelector('.chat-sender');
      expect(senderEl).toBeTruthy();
      expect(senderEl.textContent.trim()).toBe('Alice');
    });

    it('should NOT show sender name for own messages', () => {
      fixture.componentRef.setInput('messages', [
        makeMessage({ isSelf: true }),
      ]);
      fixture.detectChanges();

      const senderEl = fixture.nativeElement.querySelector('.chat-sender');
      expect(senderEl).toBeNull();
    });
  });

  // ── send interaction ────────────────────────────────────────────────────────

  describe('send interaction', () => {
    it('should emit messageSent with the draft text', () => {
      const emitSpy = jest.spyOn(component.messageSent, 'emit');
      setDraft(component, 'Hello World');
      triggerSend(component);

      expect(emitSpy).toHaveBeenCalledWith('Hello World');
    });

    it('should clear the draft after sending', () => {
      setDraft(component, 'Test message');
      triggerSend(component);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input.chat-input'));
      expect(input.nativeElement.value).toBe('');
    });

    it('should NOT emit when draft is empty', () => {
      const emitSpy = jest.spyOn(component.messageSent, 'emit');
      setDraft(component, '');
      triggerSend(component);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should NOT emit when draft is whitespace only', () => {
      const emitSpy = jest.spyOn(component.messageSent, 'emit');
      setDraft(component, '   ');
      triggerSend(component);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit messageSent on Enter keydown', () => {
      const emitSpy = jest.spyOn(component.messageSent, 'emit');
      setDraft(component, 'Enter key message');

      const inputEl = fixture.debugElement.query(By.css('input.chat-input'));
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: false,
        bubbles: true,
      });
      inputEl.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledWith('Enter key message');
    });

    it('should NOT emit on Shift+Enter keydown', () => {
      const emitSpy = jest.spyOn(component.messageSent, 'emit');
      setDraft(component, 'Shift+Enter message');

      const inputEl = fixture.debugElement.query(By.css('input.chat-input'));
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: true,
        bubbles: true,
      });
      inputEl.nativeElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
