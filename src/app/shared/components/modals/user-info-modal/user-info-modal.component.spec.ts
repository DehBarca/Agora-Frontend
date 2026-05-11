import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoModalComponent } from './user-info-modal.component';

describe('UserInfoModalComponent', () => {
  let component: UserInfoModalComponent;
  let fixture: ComponentFixture<UserInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
