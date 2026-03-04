import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserProfile } from './models/user-profile.model';

const MOCK_USER_PROFILE: UserProfile = {
  id: '1',
  name: 'Alex Morgan',
  email: 'alex.morgan@nightfall.io',
  role: 'Senior Portfolio Manager',
  department: 'Asset Management',
  location: 'New York, NY',
  bio: 'Experienced portfolio manager with 10+ years in equity and alternative investments. Focused on long-term value creation and risk-adjusted returns.',
  avatarInitials: 'AM',
  joinDate: 'March 2018',
  phone: '+1 (212) 555-0192',
};

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  getProfile(): Observable<UserProfile> {
    return of(MOCK_USER_PROFILE);
  }
}
