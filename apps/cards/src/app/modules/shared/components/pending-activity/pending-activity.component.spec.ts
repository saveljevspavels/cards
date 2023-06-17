import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingActivityComponent } from './pending-activity.component';

describe('PendingActivityComponent', () => {
  let component: PendingActivityComponent;
  let fixture: ComponentFixture<PendingActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
