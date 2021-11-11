import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierBadgeComponent } from './tier-badge.component';

describe('TierBadgeComponent', () => {
  let component: TierBadgeComponent;
  let fixture: ComponentFixture<TierBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierBadgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
