import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

export type CFTopMenuAction = 'A' | 'B' | 'LOGO';

@Component({
  selector: 'app-cf-top-menu',
  templateUrl: './cf-top-menu.component.html',
  styleUrls: ['./cf-top-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFTopMenuComponent {
  // OUTPUTS
  @Output() eButtonClicked: EventEmitter<CFTopMenuAction> = new EventEmitter<CFTopMenuAction>();

  @Input() mLabelA = '';
  @Input() mLabelB = '';

  @Input() mExpanded = true;
  @Input() mStickyMenu = false;
  @Input() mLogoClickable = true;
  @Input() mShowActionButtons = true;
  @Input() mVisible = false;

  mAnimTime = 500;

  /////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mChangeDetectorRef: ChangeDetectorRef) {
    setTimeout(() => {
      this.mVisible = true;
      this.mChangeDetectorRef.detectChanges();
    }, 2);
  }

  /////////////////////////////////////////////////////////
  // ON RESIZE
  onResize(): void {
    this.mChangeDetectorRef.markForCheck();
  }

  /////////////////////////////////////////////////////////
  // ON BUTTON CLICK
  async onButtonClick(tButton: CFTopMenuAction): Promise<void> {
    if (!this.mStickyMenu) {
      if (this.mExpanded) {
        this.mExpanded = false;
      }
      if (this.mVisible) {
        this.mVisible = false;
      }
      this.mChangeDetectorRef.detectChanges();
      await new Promise(f => setTimeout(f, this.mAnimTime)); // TO SHOW THE ANIM
    }

    this.eButtonClicked.emit(tButton);
  }

  /////////////////////////////////////////////////////////
  // ON LOGO CLICKED
  async onLogoClicked(): Promise<void> {
    if (!this.mLogoClickable) {
      return;
    }

    if (this.mVisible) {
      this.mVisible = false;
    }

    this.mChangeDetectorRef.detectChanges();
    await new Promise(f => setTimeout(f, this.mAnimTime)); // TO SHOW THE ANIM

    this.eButtonClicked.emit('LOGO');
  }
}
