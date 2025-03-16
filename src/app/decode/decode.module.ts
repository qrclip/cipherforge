import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DecodeRoutingModule } from './decode-routing.module';
import { DecodeComponent } from './decode.component';
import { CFTopMenuModule } from '../shared/cf-top-menu/cf-top-menu.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CFDisplayDataComponent } from './cf-display-data/cf-display-data.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CFCameraModule } from '../shared/cf-camera/cf-camera.module';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CFKeyAndPassComponent } from './cf-key-and-pass/cf-key-and-pass.component';

@NgModule({
  declarations: [DecodeComponent, CFDisplayDataComponent, CFKeyAndPassComponent],
  imports: [
    CommonModule,
    DecodeRoutingModule,
    CFTopMenuModule,
    ProgressSpinnerModule,
    InputTextareaModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    SharedModule,
    TableModule,
    CFCameraModule,
    PasswordModule,
    InputTextModule,
  ],
})
export class DecodeModule {}
