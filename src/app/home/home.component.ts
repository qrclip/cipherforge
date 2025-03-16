import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CFTopMenuAction } from '../shared/cf-top-menu/cf-top-menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  /////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mRouter: Router) {}

  /////////////////////////////////////////////////////////
  // ON MENU BUTTON CLICKED
  onMenuButtonClicked(tButton: CFTopMenuAction) {
    switch (tButton) {
      case 'A':
        this.mRouter.navigate(['/encode']).then();
        break;
      case 'B':
        this.mRouter.navigate(['/decode']).then();
        break;
      case 'LOGO':
        // DO NOTHING
        break;
    }
  }
}
