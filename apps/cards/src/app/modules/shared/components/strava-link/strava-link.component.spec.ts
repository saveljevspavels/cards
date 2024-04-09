import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StravaLinkComponent } from './strava-link.component';

describe('StravaLinkComponent', () => {
  let component: StravaLinkComponent;
  let fixture: ComponentFixture<StravaLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StravaLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StravaLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
