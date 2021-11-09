import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgTemplatesComponent } from './svg-templates.component';

describe('SvgTemplatesComponent', () => {
  let component: SvgTemplatesComponent;
  let fixture: ComponentFixture<SvgTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
