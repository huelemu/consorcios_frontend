import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonasCards } from './personas-cards';

describe('PersonasCards', () => {
  let component: PersonasCards;
  let fixture: ComponentFixture<PersonasCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonasCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonasCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
