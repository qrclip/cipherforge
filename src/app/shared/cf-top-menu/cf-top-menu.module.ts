import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CFTopMenuComponent } from './cf-top-menu.component';
import { CFTopMenuButtonComponent } from './cf-top-menu-button/cf-top-menu-button.component';

@NgModule({
  declarations: [CFTopMenuComponent, CFTopMenuButtonComponent],
  imports: [CommonModule],
  exports: [CFTopMenuComponent],
})
export class CFTopMenuModule {}
