import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFilterComponent } from './card-filter.component';

describe('CardFilterComponent', () => {
  let component: CardFilterComponent;
  let fixture: ComponentFixture<CardFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
