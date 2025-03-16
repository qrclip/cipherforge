import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { CFCameraScan } from '../../cf-camera.types';
import { CFQRReadService } from '../../../cf-core/services/cf-qr-read.service';
import { CFQRReadWorkerCMDReadType } from '../../../../../workers/cipherforge-qr-read-worker/src/cipherforge-qr-read-lib.types';

@Component({
  selector: 'app-cf-camera',
  templateUrl: './cf-camera.component.html',
  styleUrls: ['./cf-camera.component.scss'],
  providers: [CFQRReadService],
})
export class CfCameraComponent implements OnInit, OnDestroy {
  @Output() eScan: EventEmitter<CFCameraScan> = new EventEmitter<CFCameraScan>();

  // VIEW CHILD'S
  @ViewChild('video', { static: true }) mVideo!: ElementRef;
  @ViewChild('canvas', { static: true }) mCanvas!: ElementRef;

  @Input() mScanMode: 'binary' | 'string' = 'binary';

  private mProcessing = false;

  // VARIABLES
  public mMedias: MediaStreamConstraints = {
    video: {
      facingMode: 'environment',
    },
  };
  public mIsStart = false;
  public mIsLoading = false;
  private mDestroy = new Subject<void>();
  private mScanner = () => {
    /* do nothing */
  };
  private mStopped = false;
  private mLastRequest = 0;
  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mChangeDetector: ChangeDetectorRef,
    private mCFQRReadService: CFQRReadService
  ) {}

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // ON INIT
  ngOnInit() {
    this.start();
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.mStopped = true;
    this.pause();
    this.stop();
    this.mDestroy.next();
    this.mDestroy.complete();
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // START
  public start() {
    if (this.mIsStart) {
      return;
    } else {
      // Resolve
      this.mIsLoading = true;

      // Draw handle
      this.mScanner = () => {
        if (this.mVideo.nativeElement.readyState === this.mVideo.nativeElement.HAVE_ENOUGH_DATA) {
          this.checkQRCode(this.mVideo.nativeElement).then();
          this.mChangeDetector.markForCheck();
          this.mCanvas.nativeElement.onclick = () => (this.mVideo.nativeElement.paused ? this.play() : this.pause());
        }
        if (!this.mStopped) {
          try {
            this.mLastRequest = requestAnimationFrame(this.mScanner);
          } catch (e) {
            console.error('ne-camera-dialog', e);
          }
        } else {
          cancelAnimationFrame(this.mLastRequest);
        }
      };

      navigator.mediaDevices
        .getUserMedia(this.mMedias)
        .then((stream: MediaStream) => {
          this.mVideo.nativeElement.srcObject = stream;
          this.mVideo.nativeElement.setAttribute('playsinline', 'true'); // no fullscreen on IOS
          this.mVideo.nativeElement.play();
          requestAnimationFrame(this.mScanner);
          this.status(true, false);
        })
        .catch(() => {
          this.status(false, false);
        });
    }
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // CHECK QRCODE
  private async checkQRCode(tElement: HTMLImageElement | HTMLVideoElement): Promise<void> {
    if (this.mProcessing) {
      return;
    }

    this.mProcessing = true;
    const tCanvas = this.mCanvas.nativeElement;

    const tCtx = tCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    let tWidth = 0;
    let tHeight = 0;

    // HTMLImageElement size
    if (tElement instanceof HTMLImageElement) {
      tWidth = tElement.width;
      tHeight = tElement.height;
    }

    // HTMLVideoElement size
    if (tElement instanceof HTMLVideoElement) {
      tWidth = tElement.videoWidth;
      tHeight = tElement.videoHeight;
    }

    tCanvas.width = tWidth;
    tCanvas.height = tHeight;

    // Draw image
    tCtx.drawImage(tElement, 0, 0, tWidth, tHeight);

    // Data image
    const tImageData = tCtx.getImageData(0, 0, tWidth, tHeight);

    let tScanType: CFQRReadWorkerCMDReadType = CFQRReadWorkerCMDReadType.BINARY;
    if (this.mScanMode === 'string') {
      tScanType = CFQRReadWorkerCMDReadType.STRING;
    }

    const tWorkerResp = await this.mCFQRReadService.ReadQRCode({
      type: tScanType,
      data: tImageData.data,
      width: tWidth,
      height: tHeight,
    });

    this.mProcessing = false;
    if (tWorkerResp) {
      if (this.mScanMode === 'binary' && tWorkerResp.dataArray) {
        this.eScan.next({ array: new Uint8Array(tWorkerResp.dataArray) });
      }
      if (this.mScanMode === 'string' && tWorkerResp.dataString) {
        this.eScan.next({ string: tWorkerResp.dataString });
      }
    }
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // STATUS
  private status(isStart: boolean, isLoading: boolean): void {
    this.mIsStart = isStart;
    this.mIsLoading = isLoading;
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // IS PAUSE
  get isPause(): boolean {
    return !!this.mVideo?.nativeElement?.paused;
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // IS PLAY
  get isPlay(): boolean {
    return !!this.mVideo?.nativeElement?.play;
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // PLAY
  private play() {
    if (this.isPause) {
      this.mStopped = false;
      this.mVideo?.nativeElement?.play();
    }
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // PAUSE
  private pause() {
    this.mStopped = true;
    if (this.isPlay) {
      this.mVideo?.nativeElement?.pause();
    }
  }

  /* istanbul ignore next: prefer manual testing for this one */
  ///////////////////////////////////////////////////
  // STOP
  private stop() {
    this.mIsStart = false;
    this.mIsLoading = false;
    try {
      this.mStopped = true;
      this.mVideo?.nativeElement?.srcObject?.getTracks()?.forEach((track: MediaStreamTrack) => {
        track?.stop();
      });
    } catch (error) {
      this.eScan.next({});
    }
  }
}
