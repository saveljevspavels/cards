import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionWrapperComponent } from './selection-wrapper.component';

describe('SelectionWrapperComponent', () => {
  let component: SelectionWrapperComponent;
  let fixture: ComponentFixture<SelectionWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
