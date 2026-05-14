import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingCallModalComponent } from './starting-call-modal.component';

describe('StartingCallModalComponent', () => {
  let component: StartingCallModalComponent;
  let fixture: ComponentFixture<StartingCallModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartingCallModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartingCallModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
