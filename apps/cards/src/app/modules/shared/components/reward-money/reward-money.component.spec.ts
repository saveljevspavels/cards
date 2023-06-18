import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardMoneyComponent } from './reward-money.component';

describe('RewardMoneyComponent', () => {
  let component: RewardMoneyComponent;
  let fixture: ComponentFixture<RewardMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardMoneyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
