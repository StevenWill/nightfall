import { ComponentFixture, TestBed } from '@angular/core/types/testing';
import { SettingsUi } from './settings-ui';

describe('SettingsUi', () => {
  let component: SettingsUi;
  let fixture: ComponentFixture<SettingsUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsUi],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
