import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardInstanceCreateComponent } from './card-instance-create.component';

describe('CardInstanceCreateComponent', () => {
  let component: CardInstanceCreateComponent;
  let fixture: ComponentFixture<CardInstanceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardInstanceCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardInstanceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
