import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessagingService } from '@nightfall/messaging/data-access';
import { MessagingList } from '@nightfall/messaging/ui';

@Component({
  selector: 'lib-messaging-feature',
  imports: [MessagingList],
  templateUrl: './messaging-feature.html',
  styleUrl: './messaging-feature.css',
})
export class MessagingFeature implements OnInit {
  private readonly messaging = inject(MessagingService);

  protected readonly messages = toSignal(this.messaging.messages$, {
    initialValue: [],
  });

  ngOnInit(): void {
    this.messaging.initialize();
  }
}
