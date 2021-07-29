import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionInfoComponent } from './division-info.component';

describe('DivisionInfoComponent', () => {
  let component: DivisionInfoComponent;
  let fixture: ComponentFixture<DivisionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
