import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as QRCode from 'qrcode';
import { QRCodeToDataURLOptions } from 'qrcode';
import { CFQRCodeGenerator } from '../../../cf-core/objects/cf-qrcode-generator';
import { CFPdfMakeExportOptions, CFPdfMaker } from '../../../cf-core/objects/cf-pdf-maker';
import { CFCoreEncodeService } from '../../../cf-core/services/cf-core-encode.service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DisplayEncodedOptionsComponent } from './display-encoded-options/display-encoded-options.component';
import { CFSettingsService } from '../../../cf-core/services/cf-settings.service';

interface PaperSizes {
  name: string;
  code: string;
  width: number;
  height: number;
  units: 'inches' | 'cm';
}

@Component({
  selector: 'app-display-encoded',
  templateUrl: './display-encoded.component.html',
  styleUrls: ['./display-encoded.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayEncodedComponent implements OnInit {
  mUIState: 'display' | 'exporting' | 'pdf-settings' = 'display';
  mChunkNumber = 0;
  mCurrentChunk = 0;
  mQRCodeScale = 3;
  mProgress = 0;
  mProgressInfo = 'Exporting ...';
  mPlayingQRCodes = false;
  mPlayQRCodesDelay = 10;

  mSplitMenuItems: MenuItem[] = [
    {
      label: 'Play QR Codes',
      icon: 'pi pi-fw pi-qrcode',
      command: () => this.onStartPlayQRCodes(),
    },
    {
      label: 'Download Images',
      icon: 'pi pi-fw pi-images',
      command: () => this.onDownloadImages(),
    },
    {
      label: 'Zoom in',
      icon: 'pi pi-fw pi-plus-circle',
      command: () => this.onQRCodeScale(1),
    },
    {
      label: 'Zoom out',
      icon: 'pi pi-fw pi-minus-circle',
      command: () => this.onQRCodeScale(-1),
    },
    {
      label: 'Options',
      icon: 'pi pi-fw pi-cog',
      command: () => this.onOptionsClicked(),
    },
  ];

  mPDFExportOptions: CFPdfMakeExportOptions = {
    name: 'app.cipherforge.com',
    pageWidth: 0,
    pageHeight: 0,
    QRCodeSize: 3.35 * 72,
    minMargin: 0.4 * 72,
    unit: 'inches',
  };

  mPageSizes: PaperSizes[] = [
    { name: 'Custom', code: 'Custom', width: 8.5 * 72, height: 14 * 72, units: 'inches' },
    { name: 'A4', code: 'A4', width: 8.27 * 72, height: 11.7 * 72, units: 'cm' },
    { name: 'Letter', code: 'Letter', width: 8.5 * 72, height: 11 * 72, units: 'inches' },
    { name: 'A3', code: 'A3', width: 11.7 * 72, height: 16.5 * 72, units: 'cm' },
    { name: 'Legal', code: 'Legal', width: 8.5 * 72, height: 14 * 72, units: 'inches' },
  ];
  mSelectedPageSize: PaperSizes = this.mPageSizes[0];

  ////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mChangeDetectorRef: ChangeDetectorRef,
    private mCFCoreEncodeService: CFCoreEncodeService,
    private mDialogService: DialogService,
    private mCFSettingsService: CFSettingsService
  ) {}

  ////////////////////////////////////////////////
  // ON INIT
  async ngOnInit() {
    this.initDisplay().then();
  }

  ////////////////////////////////////////////////
  // INIT DISPLAY
  private async initDisplay(): Promise<void> {
    this.mQRCodeScale = await this.mCFSettingsService.getQRCodeScale();
    this.mChunkNumber = await this.mCFCoreEncodeService.getChunkNumber();
    await this.loadPdfSettings();
    await this.setCurrentChunk(0);
  }

  ////////////////////////////////////////////////
  // LOAD PDF SETTINGS
  private async loadPdfSettings(): Promise<void> {
    const tPDFSettings = await this.mCFSettingsService.getPDFSettings();
    if (tPDFSettings) {
      this.mPDFExportOptions.pageWidth = tPDFSettings.pageWidth;
      this.mPDFExportOptions.pageHeight = tPDFSettings.pageHeight;
      this.mPDFExportOptions.QRCodeSize = tPDFSettings.QRCodeSize;
      this.mPDFExportOptions.minMargin = tPDFSettings.minMargin;
      this.mPDFExportOptions.unit = tPDFSettings.unit;

      this.mPageSizes[0].width = tPDFSettings.pageWidth;
      this.mPageSizes[0].height = tPDFSettings.pageHeight;
      let tPageIndex = 0;
      for (let p = 0; p < this.mPageSizes.length; p++) {
        if (
          this.mPageSizes[p].width === tPDFSettings.pageWidth &&
          this.mPageSizes[p].height === tPDFSettings.pageHeight &&
          this.mPageSizes[p].units === tPDFSettings.unit
        ) {
          tPageIndex = p;
        }
      }

      this.mPageSizes[0].units = this.mPDFExportOptions.unit;
      this.mSelectedPageSize = this.mPageSizes[tPageIndex];
    } else {
      this.mSelectedPageSize = this.mPageSizes[1];
      this.onPageSizeChanged();
    }
  }

  ////////////////////////////////////////////////
  // SET CURRENT CHUNK
  private async setCurrentChunk(tChunkNumber: number): Promise<void> {
    this.mCurrentChunk = tChunkNumber;

    const tOptions: QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'Q',
      scale: this.mQRCodeScale,
    };

    const tCipherforgeEncodedChunk = await this.mCFCoreEncodeService.getChunkData(this.mCurrentChunk);
    if (this.mChunkNumber > 1) {
      tOptions.version = +tCipherforgeEncodedChunk.version;
    }
    tOptions.errorCorrectionLevel = tCipherforgeEncodedChunk.errorCorrection;

    const tCanvas = document.getElementById('qr-canvas');
    await QRCode.toCanvas(tCanvas, [{ mode: 'byte', data: tCipherforgeEncodedChunk.data }], tOptions);

    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////
  // ON PREVIOUS QR CODE
  async onPreviousQRCode(): Promise<void> {
    if (this.mCurrentChunk > 0) {
      await this.setCurrentChunk(this.mCurrentChunk - 1);
    } else {
      await this.setCurrentChunk(this.mChunkNumber - 1);
    }
  }

  ////////////////////////////////////////////////
  // ON NEXT QR CODE
  async onNextQRCode() {
    if (this.mCurrentChunk + 1 < this.mChunkNumber) {
      await this.setCurrentChunk(this.mCurrentChunk + 1);
    } else {
      await this.setCurrentChunk(0);
    }
  }

  ////////////////////////////////////////////////
  // ON DOWNLOAD IMAGES
  async onDownloadImages(): Promise<void> {
    this.mUIState = 'exporting';
    this.mProgressInfo = 'Exporting images...';
    this.mProgress = 0;
    this.mChangeDetectorRef.detectChanges();

    let tMultipleQRCode = false;
    if (this.mChunkNumber > 1) {
      tMultipleQRCode = true;
    }

    const tCFQrcodeGenerator = new CFQRCodeGenerator();
    const tPadding = this.mChunkNumber.toString().length;

    for (let i = 0; i < this.mChunkNumber; i++) {
      const tCipherforgeEncodedChunk = await this.mCFCoreEncodeService.getChunkData(i);
      const tQRCodeNumber = i + 1;

      await tCFQrcodeGenerator.downloadQRCode(
        tCipherforgeEncodedChunk.data,
        'qrcode-' + tQRCodeNumber.toString().padStart(tPadding, '0') + '.png',
        tMultipleQRCode,
        tCipherforgeEncodedChunk.version,
        tCipherforgeEncodedChunk.errorCorrection
      );
      const tProgress = Math.ceil(((i + 1) / this.mChunkNumber) * 100);
      if (tProgress !== this.mProgress) {
        this.mProgress = tProgress;
        this.mChangeDetectorRef.detectChanges();
      }
      await new Promise(f => setTimeout(f, 250));
    }

    this.mUIState = 'display';
    this.mChangeDetectorRef.detectChanges();
    await this.setCurrentChunk(0);
  }

  ////////////////////////////////////////////////
  // ON START PLAY QR CODES
  onStartPlayQRCodes() {
    this.mPlayingQRCodes = true;
    this.mChangeDetectorRef.detectChanges();
    this.playNextQRCode();
  }

  ////////////////////////////////////////////////
  // ON STOP PLAY QR CODES
  onStopPlayQRCodes() {
    this.mPlayingQRCodes = false;
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////
  // PLAY NEXT QR CODE
  playNextQRCode(): void {
    setTimeout(() => {
      if (this.mPlayingQRCodes) {
        this.onNextQRCode().then();
        this.playNextQRCode();
      }
    }, this.mPlayQRCodesDelay * 100);
  }

  ////////////////////////////////////////////////
  // ON PDF EXPORT SETTINGS
  onPDFExportSettings(): void {
    this.mUIState = 'pdf-settings';
    this.mChangeDetectorRef.detectChanges();
  }

  ////////////////////////////////////////////////
  // ON BACK FROM SETTINGS
  public onBackFromSettings(): void {
    this.mUIState = 'display';
    this.mChangeDetectorRef.detectChanges();
    this.setCurrentChunk(this.mCurrentChunk).then();
  }

  ////////////////////////////////////////////////
  // ON PAGE SIZE CHANGED
  onPageSizeChanged(): void {
    this.mPDFExportOptions.pageWidth = this.mSelectedPageSize.width;
    this.mPDFExportOptions.pageHeight = this.mSelectedPageSize.height;
    this.mPDFExportOptions.unit = this.mSelectedPageSize.units;
  }

  ////////////////////////////////////////////////
  // FINALIZE EXPORT PDF
  public async finalizeExportPDF(): Promise<void> {
    this.mProgressInfo = 'Exporting pdf...';
    this.mProgress = 0;
    this.mUIState = 'exporting';
    this.mChangeDetectorRef.detectChanges();

    // SAVE THE SETTINGS
    this.mCFSettingsService.setPDFSettings(this.mPDFExportOptions).then();

    await new Promise(f => setTimeout(f, 10)); // WORK AROUND TO UPDATE THE UI

    const tCFPdfMaker = new CFPdfMaker();
    let tMultipleQRCode = false;
    if (this.mChunkNumber > 1) {
      tMultipleQRCode = true;
    }

    const tCFQrcodeGenerator = new CFQRCodeGenerator();
    for (let i = 0; i < this.mChunkNumber; i++) {
      const tCipherforgeEncodedChunk = await this.mCFCoreEncodeService.getChunkData(i);
      const tDataUrl = await tCFQrcodeGenerator.generateDataURL(
        tCipherforgeEncodedChunk.data,
        tMultipleQRCode,
        tCipherforgeEncodedChunk.version,
        tCipherforgeEncodedChunk.errorCorrection
      );
      tCFPdfMaker.addQRCode(i, tDataUrl);

      const tProgress = Math.ceil(((i + 1) / this.mChunkNumber) * 100);
      if (tProgress !== this.mProgress) {
        this.mProgress = tProgress;
        this.mChangeDetectorRef.detectChanges();
        await new Promise(f => setTimeout(f, 10)); // WORK AROUND TO UPDATE THE UI
      }
    }

    await new Promise(f => setTimeout(f, 10)); // WORK AROUND TO UPDATE THE UI

    this.mProgress = -1;
    this.mProgressInfo = 'Finalizing PDF please wait...';
    this.mChangeDetectorRef.detectChanges();

    await new Promise(f => setTimeout(f, 10)); // WORK AROUND TO UPDATE THE UI

    await tCFPdfMaker.downloadFile(this.mPDFExportOptions);

    this.mUIState = 'display';
    this.mChangeDetectorRef.detectChanges();
    await this.setCurrentChunk(0);
  }

  ////////////////////////////////////////////////
  // ON QR CODE SCALE
  onQRCodeScale(tNumber: number) {
    this.mQRCodeScale += tNumber;
    if (this.mQRCodeScale < 1) {
      this.mQRCodeScale = 1;
    }
    if (this.mQRCodeScale > 10) {
      this.mQRCodeScale = 10;
    }
    this.setCurrentChunk(this.mCurrentChunk).then();
    this.mCFSettingsService.setQRCodeScale(this.mQRCodeScale).then();
  }

  ////////////////////////////////////////////////
  // ON OPTIONS CLICKED
  private onOptionsClicked() {
    const tDialogRef = this.mDialogService.open(DisplayEncodedOptionsComponent, {
      showHeader: true,
      header: 'Options',
      closeOnEscape: true,
      dismissableMask: true,
      data: {
        options: this.mCFCoreEncodeService.getOptions(),
      },
    });

    // ON CLOSE
    tDialogRef.onClose.subscribe(tValue => {
      if (tValue && tValue.version && tValue.errorCorrection) {
        this.mCFCoreEncodeService.changeEncodeOptions(tValue.version, tValue.errorCorrection).then(() => {
          this.initDisplay().then();
        });
      }
    });
  }
}
