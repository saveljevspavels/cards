import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittingActivityComponent } from './submitting-activity.component';

describe('SubmittingActivityComponent', () => {
  let component: SubmittingActivityComponent;
  let fixture: ComponentFixture<SubmittingActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmittingActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmittingActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
