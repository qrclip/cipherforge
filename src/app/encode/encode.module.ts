import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EncodeRoutingModule } from './encode-routing.module';
import { EncodeComponent } from './encode.component';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ChipsModule } from 'primeng/chips';
import { KeyFilterModule } from 'primeng/keyfilter';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CFSimpleHeaderModule } from '../shared/cf-simple-header/cf-simple-header.module';
import { TableModule } from 'primeng/table';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CFCameraModule } from '../shared/cf-camera/cf-camera.module';
import { CFShareKeyModule } from '../shared/cf-share-key/cf-share-key.module';
import { EncodePasswordSettingsComponent } from './components/encode-password-settings/encode-password-settings.component';
import { SliderModule } from 'primeng/slider';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DisplayEncodedComponent } from './components/display-encoded/display-encoded.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { CFInputUnitModule } from '../shared/cf-input-unit/cf-input-unit.module';
import { ToastModule } from 'primeng/toast';
import { DisplayEncodedOptionsComponent } from './components/display-encoded/display-encoded-options/display-encoded-options.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [
    EncodeComponent,
    EncodePasswordSettingsComponent,
    DisplayEncodedComponent,
    DisplayEncodedOptionsComponent,
  ],
  imports: [
    CommonModule,
    EncodeRoutingModule,
    TabViewModule,
    InputTextareaModule,
    CardModule,
    FormsModule,
    PasswordModule,
    ButtonModule,
    ChipsModule,
    KeyFilterModule,
    RadioButtonModule,
    CFSimpleHeaderModule,
    TableModule,
    ContextMenuModule,
    CFCameraModule,
    CFShareKeyModule,
    SliderModule,
    DropdownModule,
    RippleModule,
    ProgressSpinnerModule,
    SplitButtonModule,
    FileUploadModule,
    PaginatorModule,
    CFInputUnitModule,
    ToastModule,
    ConfirmDialogModule,
  ],
})
export class EncodeModule {}
