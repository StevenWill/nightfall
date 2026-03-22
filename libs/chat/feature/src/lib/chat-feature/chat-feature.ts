import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatService } from '@nightfall/chat/data-access';
import { ChatWindow } from '@nightfall/chat/ui';

@Component({
  selector: 'lib-chat-feature',
  imports: [ChatWindow],
  templateUrl: './chat-feature.html',
  styleUrl: './chat-feature.css',
})
export class ChatFeature implements OnInit {
  private readonly chat = inject(ChatService);

  protected readonly messages = toSignal(this.chat.messages$, {
    initialValue: [],
  });

  ngOnInit(): void {
    this.chat.initialize();
  }

  protected onMessageSent(text: string): void {
    this.chat.send(text);
  }
}
