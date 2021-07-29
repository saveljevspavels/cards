import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteManagementComponent } from './athlete-management.component';

describe('AthleteManagementComponent', () => {
  let component: AthleteManagementComponent;
  let fixture: ComponentFixture<AthleteManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AthleteManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AthleteManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
