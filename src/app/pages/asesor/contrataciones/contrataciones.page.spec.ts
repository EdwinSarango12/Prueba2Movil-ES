import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratacionesPage } from './contrataciones.page';

describe('ContratacionesPage', () => {
  let component: ContratacionesPage;
  let fixture: ComponentFixture<ContratacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContratacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

