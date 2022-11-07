import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuxButtonComponent } from './focux-button.component';

describe('FocuxButtonComponent', () => {
  let component: FocuxButtonComponent;
  let fixture: ComponentFixture<FocuxButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FocuxButtonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FocuxButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
