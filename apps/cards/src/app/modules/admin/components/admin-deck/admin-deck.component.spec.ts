import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeckComponent } from './admin-deck.component';

describe('AdminDeckComponent', () => {
  let component: AdminDeckComponent;
  let fixture: ComponentFixture<AdminDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDeckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
