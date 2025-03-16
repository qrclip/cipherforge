import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { HomeModule } from './home.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeModule, RouterTestingModule],
      declarations: [HomeComponent],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate encode', () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.onMenuButtonClicked('A');
    expect(router.navigate).toHaveBeenCalledWith(['/encode']);
  });

  it('should navigate decode', () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.onMenuButtonClicked('B');
    expect(router.navigate).toHaveBeenCalledWith(['/decode']);
  });

  it('should do nothing', () => {
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.onMenuButtonClicked('LOGO');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
