import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardEnergyComponent } from './reward-energy.component';

describe('RewardEnergyComponent', () => {
  let component: RewardEnergyComponent;
  let fixture: ComponentFixture<RewardEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardEnergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
