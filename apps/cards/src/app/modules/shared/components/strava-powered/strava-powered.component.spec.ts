import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StravaPoweredComponent } from './strava-powered.component';

describe('StravaPoweredComponent', () => {
  let component: StravaPoweredComponent;
  let fixture: ComponentFixture<StravaPoweredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StravaPoweredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StravaPoweredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
