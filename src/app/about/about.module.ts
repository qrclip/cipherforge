import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { CFSimpleHeaderModule } from '../shared/cf-simple-header/cf-simple-header.module';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, AboutRoutingModule, CFSimpleHeaderModule],
})
export class AboutModule {}
