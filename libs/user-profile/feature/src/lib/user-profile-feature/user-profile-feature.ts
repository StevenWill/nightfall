import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserProfileService } from '@nightfall/user-profile/data-access';
import { UserProfileCard } from '@nightfall/user-profile/ui';

@Component({
  selector: 'lib-user-profile-feature',
  imports: [UserProfileCard],
  templateUrl: './user-profile-feature.html',
  styleUrl: './user-profile-feature.scss',
})
export class UserProfileFeature {
  private readonly userProfileService = inject(UserProfileService);
  profile = toSignal(this.userProfileService.getProfile());
}
