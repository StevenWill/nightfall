import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileCard, UserProfileItem } from './user-profile-ui';

const mockProfile: UserProfileItem = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Developer',
  department: 'Engineering',
  location: 'London',
  bio: 'A test bio.',
  avatarInitials: 'TU',
  joinDate: 'January 2024',
  phone: '+1 555-0000',
};

describe('UserProfileCard', () => {
  let component: UserProfileCard;
  let fixture: ComponentFixture<UserProfileCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileCard);
    fixture.componentRef.setInput('profile', mockProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
