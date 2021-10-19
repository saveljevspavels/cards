import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWorkoutInfoComponent } from './base-workout-info.component';

describe('BaseWorkoutInfoComponent', () => {
  let component: BaseWorkoutInfoComponent;
  let fixture: ComponentFixture<BaseWorkoutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseWorkoutInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseWorkoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
