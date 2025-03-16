import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cf-simple-header',
  templateUrl: './cf-simple-header.component.html',
  styleUrls: ['./cf-simple-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFSimpleHeaderComponent {
  @Input() mHeader = '';

  public mHide = true;

  ////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mChangeDetectorRef: ChangeDetectorRef) {
    setTimeout(() => {
      this.mHide = false;
      this.mChangeDetectorRef.detectChanges();
    }, 50);
  }
}
