import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTypeIconComponent } from './activity-type-icon.component';

describe('ActivityTypeIconComponent', () => {
  let component: ActivityTypeIconComponent;
  let fixture: ComponentFixture<ActivityTypeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityTypeIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTypeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
