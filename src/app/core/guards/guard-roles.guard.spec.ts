import { TestBed } from '@angular/core/testing';

import { GuardAuthGuard } from './guard-auth.guard';

describe('GuardRolesGuard', () => {
  let guard: GuardAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
