import {
  Component,
  input,
  AfterViewChecked,
  ElementRef,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';

/** View model for a single notification displayed in the messaging list. */
export interface NotificationMessage {
  id: string;
  senderName: string;
  preview: string;
  sentAt: string;
  channel: 'in-app' | 'sms' | 'push';
}

@Component({
  selector: 'lib-messaging-list',
  imports: [DatePipe],
  templateUrl: './messaging-ui.html',
  styleUrl: './messaging-ui.css',
})
export class MessagingList implements AfterViewChecked {
  /** Notification messages to display. */
  messages = input<NotificationMessage[]>([]);

  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');

  ngAfterViewChecked(): void {
    this.messagesEnd()?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
