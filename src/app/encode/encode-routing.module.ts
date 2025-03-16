import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncodeComponent } from './encode.component';

const routes: Routes = [{ path: '', component: EncodeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncodeRoutingModule {}
