import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CFShareKeyDialogComponent } from './cf-share-key-dialog/cf-share-key-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CFShareKeyService } from './cf-share-key.service';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  declarations: [CFShareKeyDialogComponent],
  imports: [CommonModule, ButtonModule, RippleModule],
  providers: [CFShareKeyService, DialogService],
})
export class CFShareKeyModule {}
