import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagingDataAccess } from './messaging-data-access';

describe('MessagingDataAccess', () => {
  let component: MessagingDataAccess;
  let fixture: ComponentFixture<MessagingDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagingDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
