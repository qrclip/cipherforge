import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cf-top-menu-button',
  templateUrl: './cf-top-menu-button.component.html',
  styleUrls: ['./cf-top-menu-button.component.scss'],
})
export class CFTopMenuButtonComponent {
  @Input() mLabel = '';
  mSmallMode = false;
  private mWidth = 100;
  public mFontSizePx = 0;

  /////////////////////////////////////////////////////
  //
  @Input() set sBaseWidth(tValue: number | null) {
    if (tValue) {
      this.mWidth = tValue;
      this.calculateFontSize();
    }
  }

  /////////////////////////////////////////////////////
  //
  @Input() set sSmallMode(tValue: boolean | null) {
    /* istanbul ignore next */
    this.mSmallMode = tValue ?? false;
    this.calculateFontSize();
  }

  /////////////////////////////////////////////////////
  // CALCULATE FONT SIZE
  private calculateFontSize(): void {
    this.mFontSizePx = this.mWidth / 10;
    if (this.mFontSizePx > 60) {
      this.mFontSizePx = 60;
    }
    /* istanbul ignore if */
    if (this.mSmallMode) {
      this.mFontSizePx = 18;
    }
  }
}
