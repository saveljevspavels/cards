import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementManagementComponent } from './achievement-management.component';

describe('AchievementManagementComponent', () => {
  let component: AchievementManagementComponent;
  let fixture: ComponentFixture<AchievementManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AchievementManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
