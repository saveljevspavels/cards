import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTaskViewComponent } from './completed-task-view.component';

describe('CompletedTaskViewComponent', () => {
  let component: CompletedTaskViewComponent;
  let fixture: ComponentFixture<CompletedTaskViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedTaskViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
