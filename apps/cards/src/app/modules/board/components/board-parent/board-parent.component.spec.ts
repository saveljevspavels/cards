import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardParentComponent } from './board-parent.component';

describe('BoardParentComponent', () => {
  let component: BoardParentComponent;
  let fixture: ComponentFixture<BoardParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
