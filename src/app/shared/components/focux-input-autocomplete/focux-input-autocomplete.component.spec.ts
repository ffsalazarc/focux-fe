import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocuxInputAutocompleteComponent } from './focux-input-autocomplete.component';

describe('FocuxInputAutocompleteComponent', () => {
  let component: FocuxInputAutocompleteComponent;
  let fixture: ComponentFixture<FocuxInputAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FocuxInputAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FocuxInputAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
