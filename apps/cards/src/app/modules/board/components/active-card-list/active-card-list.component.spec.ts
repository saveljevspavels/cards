import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCardListComponent } from './active-card-list.component';

describe('ActiveCardListComponent', () => {
  let component: ActiveCardListComponent;
  let fixture: ComponentFixture<ActiveCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveCardListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
