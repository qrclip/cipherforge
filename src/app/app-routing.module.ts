/* istanbul ignore file */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'encode',
    loadChildren: () => import('./encode/encode.module').then(m => m.EncodeModule),
  },
  {
    path: 'decode',
    loadChildren: () => import('./decode/decode.module').then(m => m.DecodeModule),
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
