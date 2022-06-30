import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCounterComponent } from './generic-counter.component';

describe('GenericCounterComponent', () => {
  let component: GenericCounterComponent;
  let fixture: ComponentFixture<GenericCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericCounterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
