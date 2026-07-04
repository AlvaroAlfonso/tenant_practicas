// frontend/src/app/modules/dashboard/pages/dashboard-home/dashboard-home.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHomeComponent } from './dashboard-home'; // <-- Cambiado el nombre del archivo si aplica o la importación

describe('DashboardHomeComponent', () => {
  let component: DashboardHomeComponent;
  let fixture: ComponentFixture<DashboardHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHomeComponent], // <-- Inyectamos el nombre correcto de tu clase Standalone
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});