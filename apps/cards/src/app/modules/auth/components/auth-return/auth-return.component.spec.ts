import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthReturnComponent } from './auth-return.component';

describe('AuthReturnComponent', () => {
  let component: AuthReturnComponent;
  let fixture: ComponentFixture<AuthReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthReturnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
