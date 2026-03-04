import { Component, input } from '@angular/core';

export interface UserProfileItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  bio: string;
  avatarInitials: string;
  joinDate: string;
  phone: string;
}

@Component({
  selector: 'lib-user-profile-card',
  imports: [],
  templateUrl: './user-profile-ui.html',
  styleUrl: './user-profile-ui.scss',
})
export class UserProfileCard {
  profile = input.required<UserProfileItem>();
}
