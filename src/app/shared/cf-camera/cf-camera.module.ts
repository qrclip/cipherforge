import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CFCameraDialogComponent } from './cf-camera-dialog/cf-camera-dialog.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CFCameraService } from './cf-camera.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CfCameraComponent } from './cf-camera/cf-camera.component';

@NgModule({
  declarations: [CFCameraDialogComponent, CfCameraComponent],
  imports: [CommonModule, ProgressSpinnerModule],
  exports: [CfCameraComponent],
  providers: [CFCameraService, DialogService],
})
export class CFCameraModule {}
