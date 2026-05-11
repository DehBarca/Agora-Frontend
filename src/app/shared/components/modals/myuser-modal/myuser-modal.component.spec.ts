import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyuserModalComponent } from './myuser-modal.component';

describe('MyuserModalComponent', () => {
  let component: MyuserModalComponent;
  let fixture: ComponentFixture<MyuserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyuserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyuserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
