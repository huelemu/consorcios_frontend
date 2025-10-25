import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaCard } from './persona-card';

describe('PersonaCard', () => {
  let component: PersonaCard;
  let fixture: ComponentFixture<PersonaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
