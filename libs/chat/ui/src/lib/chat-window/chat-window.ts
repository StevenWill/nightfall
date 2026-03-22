import {
  Component,
  input,
  output,
  signal,
  AfterViewChecked,
  ElementRef,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

/** View model for a single chat message displayed in the chat window. */
export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  sentAt: string;
  isSelf: boolean;
  channel: 'in-app' | 'push' | 'local';
}

@Component({
  selector: 'lib-chat-window',
  imports: [DatePipe, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements AfterViewChecked {
  /** Full message history to display. */
  messages = input<ChatMessage[]>([]);

  /** Emits when the user submits a new message. */
  messageSent = output<string>();

  /** The current draft message in the input box. */
  protected draft = signal('');

  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');

  ngAfterViewChecked(): void {
    this.messagesEnd()?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.messageSent.emit(text);
    this.draft.set('');
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
