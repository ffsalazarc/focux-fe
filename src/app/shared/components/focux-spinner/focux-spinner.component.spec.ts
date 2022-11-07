import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuxSpinnerComponent } from './focux-spinner.component';

describe('FocuxSpinnerComponent', () => {
  let component: FocuxSpinnerComponent;
  let fixture: ComponentFixture<FocuxSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FocuxSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FocuxSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
