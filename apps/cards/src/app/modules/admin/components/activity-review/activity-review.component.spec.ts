import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityReviewComponent } from './activity-review.component';

describe('ActivityReviewComponent', () => {
  let component: ActivityReviewComponent;
  let fixture: ComponentFixture<ActivityReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
