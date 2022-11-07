import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCollaboratorsAssignmentComponent } from './list-collaborators.component';

describe('ListCollaboratorsComponent', () => {
  let component: ListCollaboratorsAssignmentComponent;
  let fixture: ComponentFixture<ListCollaboratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCollaboratorsAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCollaboratorsAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
