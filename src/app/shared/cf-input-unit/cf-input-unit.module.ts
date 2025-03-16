import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CFInputUnitComponent } from './cf-input-unit.component';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  declarations: [CFInputUnitComponent],
  imports: [CommonModule, PaginatorModule],
  exports: [CFInputUnitComponent],
})
export class CFInputUnitModule {}
