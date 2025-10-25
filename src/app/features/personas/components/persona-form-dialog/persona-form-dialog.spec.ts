import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaFormDialog } from './persona-form-dialog';

describe('PersonaFormDialog', () => {
  let component: PersonaFormDialog;
  let fixture: ComponentFixture<PersonaFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonaFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
