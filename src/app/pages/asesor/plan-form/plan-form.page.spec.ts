import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanFormPage } from './plan-form.page';

describe('PlanFormPage', () => {
  let component: PlanFormPage;
  let fixture: ComponentFixture<PlanFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

