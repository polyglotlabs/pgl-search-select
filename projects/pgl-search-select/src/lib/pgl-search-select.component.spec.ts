import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PGLSearchSelectComponent } from './pgl-search-select.component';

describe('PglSearchSelectComponent', () => {
  let component: PGLSearchSelectComponent<any>;
  let fixture: ComponentFixture<PGLSearchSelectComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PGLSearchSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PGLSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
