import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-cf-input-unit',
  templateUrl: './cf-input-unit.component.html',
  styleUrls: ['./cf-input-unit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(/* istanbul ignore next */ () => CFInputUnitComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CFInputUnitComponent {
  @Input() set sUnit(tValue: 'cm' | 'inches' | null) {
    if (tValue) {
      this.mUnit = tValue;
    }
  }

  mUnit: 'cm' | 'inches' = 'cm';
  mValueCm = 0;
  mValueInches = 0;
  mValue = 0;

  ////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mChangeDetectorRef: ChangeDetectorRef) {}

  /* istanbul ignore next */
  ////////////////////////////////////////
  // ON CHANGE
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onChange: (value: number) => void = () => {};

  /* istanbul ignore next */
  ////////////////////////////////////////
  // ON TOUCHED
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onTouched: () => void = () => {};

  ////////////////////////////////////////
  // WRITE VALUE
  writeValue(tValue: number): void {
    if (tValue !== null && !isNaN(tValue)) {
      this.mValue = tValue;
      this.mValueCm = this.mValue / 28.3464567;
      this.mValueInches = this.mValue / 72;
      this.mChangeDetectorRef.markForCheck();
      this.valueChanged();
    }
  }

  /* istanbul ignore next */
  ////////////////////////////////////////
  // REGISTER ON CHANGE
  registerOnChange(onChange: (value: number) => void): void {
    this.onChange = onChange;
  }

  /* istanbul ignore next */
  ////////////////////////////////////////
  // REGISTER ON TOUCHED
  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  ////////////////////////////////////////////////
  // VALUE CHANGED
  private valueChanged(): void {
    this.onChange(+this.mValue);
    this.mChangeDetectorRef.markForCheck();
  }

  ///////////////////////////////////////////////////////
  // ON VALUE CHANGED
  onValueChanged(tUnitChanged: 'cm' | 'inches'): void {
    if (tUnitChanged === 'cm') {
      this.mValue = this.mValueCm * 28.3464567;
      this.mValueInches = this.mValue / 72;
    }
    if (tUnitChanged === 'inches') {
      this.mValue = this.mValueInches * 72;
      this.mValueCm = this.mValue / 28.3464567;
    }
    this.valueChanged();
  }
}
