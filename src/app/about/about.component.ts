import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  /////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mRouter: Router) {}

  /* istanbul ignore next */
  ///////////////////////////////////////////////////////////////
  // ON HEADER LOGO CLICKED
  onHeaderLogoClicked() {
    this.mRouter.navigate(['/']).then();
  }
}
