import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentCollaboratorComponent } from './assignment-collaborator.component';

describe('AssignmentCollaboratorComponent', () => {
  let component: AssignmentCollaboratorComponent;
  let fixture: ComponentFixture<AssignmentCollaboratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentCollaboratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentCollaboratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
