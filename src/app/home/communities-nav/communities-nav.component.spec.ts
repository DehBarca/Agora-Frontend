import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitiesNavComponent } from './communities-nav.component';

describe('CommunitiesNavComponent', () => {
  let component: CommunitiesNavComponent;
  let fixture: ComponentFixture<CommunitiesNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitiesNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunitiesNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
