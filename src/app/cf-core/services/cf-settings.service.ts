import { Injectable } from '@angular/core';
import {
  CF_DEFAULT_PASS_LEVEL_MEM,
  CF_DEFAULT_PASS_LEVEL_OPS,
  CFErrorCorrectionLevel,
  CFQRCodeVersion,
  CipherforgePassLevel,
} from '../cipherforge.types';

const CF_PASS_SETTINGS = 'CF_PASS_SETTINGS';
const CF_QR_ENCODING_SETTINGS = 'CF_QR_ENCODING_SETTINGS';
const CF_PDF_SETTINGS = 'CF_PDF_SETTINGS';
const CF_QR_CODE_SCALE = 'CF_QR_CODE_SCALE';

export interface CFQRCodeEncodingOption {
  version: CFQRCodeVersion;
  errorCorrection: CFErrorCorrectionLevel;
}

export interface CFPDFSettings {
  unit: 'cm' | 'inches';
  pageWidth: number;
  pageHeight: number;
  QRCodeSize: number;
  minMargin: number;
}

@Injectable({
  providedIn: 'root',
})
export class CFSettingsService {
  private mLoaded = false;
  private mCFSettingsPassword!: CipherforgePassLevel;
  private mCFQRCodeEncodingOption!: CFQRCodeEncodingOption;
  private mQRCodeScale!: number;
  private mCFPDFSettings!: CFPDFSettings | null;

  /////////////////////////////////////////////
  // CONSTRUCTOR
  constructor() {
    this.resetDefaults();
  }

  /////////////////////////////////////////////
  // RESET DEFAULTS
  private resetDefaults(): void {
    this.mLoaded = false;
    this.mCFSettingsPassword = {
      ops: CF_DEFAULT_PASS_LEVEL_OPS,
      mem: CF_DEFAULT_PASS_LEVEL_MEM,
    };
    this.mCFQRCodeEncodingOption = {
      version: '20',
      errorCorrection: 'H',
    };
    this.mQRCodeScale = 3;
    this.mCFPDFSettings = null;
  }

  /////////////////////////////////////////////
  // LOAD SETTINGS
  private async loadSettings(): Promise<void> {
    if (this.mLoaded) {
      return;
    }
    this.mLoaded = true;
    await this.loadQRCodeScale();
    await this.loadPasswordSettings();
    await this.loadQRCodeEncodingOption();
    await this.loadPDFSettings();
  }

  /////////////////////////////////////////////
  // LOAD QR CODE SCALE
  private async loadQRCodeScale(): Promise<void> {
    this.mQRCodeScale = +(localStorage.getItem(CF_QR_CODE_SCALE) ?? 3);
  }

  /////////////////////////////////////////////
  // LOAD QR CODE ENCODING OPTION
  private async loadQRCodeEncodingOption(): Promise<void> {
    const tSettings = localStorage.getItem(CF_QR_ENCODING_SETTINGS);
    if (tSettings) {
      try {
        const tTMP = JSON.parse(tSettings) as CFQRCodeEncodingOption;
        if (tTMP.version && tTMP.errorCorrection) {
          this.mCFQRCodeEncodingOption = tTMP;
        }
      } catch (e) {
        /* istanbul ignore next */
        console.error('loadQRCodeEncodingOption', e);
      }
    }
  }

  /////////////////////////////////////////////
  // LOAD PDF SETTINGS
  private async loadPDFSettings(): Promise<void> {
    const tSettings = localStorage.getItem(CF_PDF_SETTINGS);
    if (tSettings) {
      try {
        const tTMP = JSON.parse(tSettings) as CFPDFSettings;
        if (tTMP.pageWidth && tTMP.pageHeight) {
          this.mCFPDFSettings = tTMP;
        }
      } catch (e) {
        /* istanbul ignore next */
        console.error('loadPDFSettings', e);
      }
    }
  }

  /////////////////////////////////////////////
  // LOAD PASSWORD SETTINGS
  private async loadPasswordSettings(): Promise<void> {
    const tSettings = localStorage.getItem(CF_PASS_SETTINGS);
    if (tSettings) {
      try {
        const tTMP = JSON.parse(tSettings) as CipherforgePassLevel;
        if (tTMP.ops && tTMP.mem) {
          this.mCFSettingsPassword = tTMP;
        }
      } catch (e) {
        /* istanbul ignore next */
        console.error('loadPasswordSettings', e);
      }
    }
  }

  /////////////////////////////////////////////
  // GET PASSWORD SETTINGS
  public async getPasswordSettings(): Promise<CipherforgePassLevel> {
    await this.loadSettings();
    return this.mCFSettingsPassword;
  }

  /////////////////////////////////////////////
  // SET PASSWORD SETTINGS
  public async setPasswordSettings(tCFSettingsPassword: CipherforgePassLevel): Promise<void> {
    this.mCFSettingsPassword = tCFSettingsPassword;
    localStorage.setItem(CF_PASS_SETTINGS, JSON.stringify(this.mCFSettingsPassword));
  }

  /////////////////////////////////////////////
  // GET QRCODE ENCODING OPTIONS
  public async getQRCodeEncodingOptions(): Promise<CFQRCodeEncodingOption> {
    await this.loadSettings();
    return this.mCFQRCodeEncodingOption;
  }

  /////////////////////////////////////////////
  // SET QRCODE ENCODING OPTIONS
  public async setQRCodeEncodingOptions(tCFQRCodeEncodingOption: CFQRCodeEncodingOption): Promise<void> {
    this.mCFQRCodeEncodingOption = tCFQRCodeEncodingOption;
    localStorage.setItem(CF_QR_ENCODING_SETTINGS, JSON.stringify(this.mCFQRCodeEncodingOption));
  }

  /////////////////////////////////////////////
  // GET QRCODE SCALE
  public async getQRCodeScale(): Promise<number> {
    await this.loadSettings();
    return this.mQRCodeScale;
  }

  /////////////////////////////////////////////
  // SET QRCODE SCALE
  public async setQRCodeScale(tQRCodeScale: number): Promise<void> {
    this.mQRCodeScale = tQRCodeScale;
    localStorage.setItem(CF_QR_CODE_SCALE, this.mQRCodeScale.toString());
  }

  /////////////////////////////////////////////
  // GET PDF SETTINGS
  public async getPDFSettings(): Promise<CFPDFSettings | null> {
    await this.loadSettings();
    return this.mCFPDFSettings;
  }

  /////////////////////////////////////////////
  // SET PDF SETTINGS
  public async setPDFSettings(tCFPDFSettings: CFPDFSettings): Promise<void> {
    this.mCFPDFSettings = tCFPDFSettings;
    localStorage.setItem(CF_PDF_SETTINGS, JSON.stringify(this.mCFPDFSettings));
  }

  /////////////////////////////////////////////
  // CLEAR SETTINGS
  public async clearSettings(): Promise<void> {
    localStorage.clear();
    this.resetDefaults();
  }
}
