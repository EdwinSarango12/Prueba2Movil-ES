import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanDetallePage } from './plan-detalle.page';

describe('PlanDetallePage', () => {
  let component: PlanDetallePage;
  let fixture: ComponentFixture<PlanDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

