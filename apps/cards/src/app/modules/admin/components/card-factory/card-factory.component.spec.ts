import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFactoryComponent } from './card-factory.component';

describe('CardFactoryComponent', () => {
  let component: CardFactoryComponent;
  let fixture: ComponentFixture<CardFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardFactoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
