import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAssignmentComponent } from './detail-assignment.component';

describe('DetailAssignmentComponent', () => {
  let component: DetailAssignmentComponent;
  let fixture: ComponentFixture<DetailAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
