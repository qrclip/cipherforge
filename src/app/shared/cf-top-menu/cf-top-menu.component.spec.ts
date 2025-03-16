/* eslint-disable */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CFTopMenuComponent } from './cf-top-menu.component';
import { CFTopMenuModule } from './cf-top-menu.module';

describe('CFTopMenuComponent', () => {
  let component: CFTopMenuComponent;
  let fixture: ComponentFixture<CFTopMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CFTopMenuModule],
      declarations: [CFTopMenuComponent],
    });
    fixture = TestBed.createComponent(CFTopMenuComponent);
    component = fixture.componentInstance;
    component.mAnimTime = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onResize', () => {
    // @ts-ignore
    spyOn(component.mChangeDetectorRef, 'markForCheck').and.callFake(() => {});

    component.onResize();

    // @ts-ignore
    expect(component.mChangeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('onLogoClicked logo clicked', async () => {
    component.mLogoClickable = true;
    component.mVisible = true;

    spyOn(component.eButtonClicked, 'emit').and.callFake(() => {});
    await component.onLogoClicked();
    expect(component.eButtonClicked.emit).toHaveBeenCalledOnceWith('LOGO');
    expect(component.mVisible).toEqual(false);
  });

  it('onLogoClicked logo clicked but not clickable', async () => {
    component.mLogoClickable = false;
    spyOn(component.eButtonClicked, 'emit').and.callFake(() => {});
    await component.onLogoClicked();
    expect(component.eButtonClicked.emit).not.toHaveBeenCalled();
  });

  it('onButtonClick A', async () => {
    component.mStickyMenu = true;
    spyOn(component.eButtonClicked, 'emit').and.callFake(() => {});
    await component.onButtonClick('A');
    expect(component.eButtonClicked.emit).toHaveBeenCalledOnceWith('A');
  });

  it('onButtonClick A not sticky', async () => {
    component.mStickyMenu = false;
    component.mExpanded = true;
    component.mVisible = true;
    spyOn(component.eButtonClicked, 'emit').and.callFake(() => {});
    await component.onButtonClick('B');
    expect(component.eButtonClicked.emit).toHaveBeenCalledOnceWith('B');
    expect(component.mExpanded).toEqual(false);
    expect(component.mVisible).toEqual(false);
  });
});
