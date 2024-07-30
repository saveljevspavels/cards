import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardBubbleComponent } from './reward-bubble.component';

describe('RewardBubbleComponent', () => {
  let component: RewardBubbleComponent;
  let fixture: ComponentFixture<RewardBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardBubbleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
