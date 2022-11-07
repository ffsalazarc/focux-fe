import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuxContentMainComponent } from './focux-content-main.component';

describe('FocuxContentMainComponent', () => {
  let component: FocuxContentMainComponent;
  let fixture: ComponentFixture<FocuxContentMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FocuxContentMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FocuxContentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
