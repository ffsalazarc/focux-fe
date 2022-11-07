import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuxPanelFilterComponent } from './focux-panel-filter.component';

describe('FocuxPanelFilterComponent', () => {
  let component: FocuxPanelFilterComponent;
  let fixture: ComponentFixture<FocuxPanelFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FocuxPanelFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FocuxPanelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
