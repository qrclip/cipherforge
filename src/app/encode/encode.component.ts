import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  CF_DEFAULT_PASS_LEVEL_MEM,
  CF_DEFAULT_PASS_LEVEL_OPS,
  CipherforgeEncodeError,
  CipherforgeEncodeOptions,
  CipherforgeFile,
  CipherforgePassLevel,
} from '../cf-core/cipherforge.types';
import { CFFileHelper } from '../shared/helpers/cf-file.helper';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { CFCrypto } from '../cf-core/objects/cf-crypto';
import { CFCameraService } from '../shared/cf-camera/cf-camera.service';
import { CFShareKeyService } from '../shared/cf-share-key/cf-share-key.service';
import { DialogService } from 'primeng/dynamicdialog';
import { EncodePasswordSettingsComponent } from './components/encode-password-settings/encode-password-settings.component';
import { CFCoreEncodeService } from '../cf-core/services/cf-core-encode.service';
import { CFToastService } from '../shared/cf-toast/cf-toast.service';
import { CFKeyHelper } from '../cf-core/objects/cf-key.helper';
import { CFSettingsService } from '../cf-core/services/cf-settings.service';

@Component({
  selector: 'app-encode',
  templateUrl: './encode.component.html',
  styleUrls: ['./encode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CFCoreEncodeService, ConfirmationService],
})
export class EncodeComponent implements OnDestroy {
  public mUIState: 'form' | 'working' | 'encoded' = 'form';

  public mText = '';
  public mPassword = '';
  public mKey = '';
  public mCipherforgePassLevel: CipherforgePassLevel = {
    ops: CF_DEFAULT_PASS_LEVEL_OPS,
    mem: CF_DEFAULT_PASS_LEVEL_MEM,
  };
  public mFiles: CipherforgeFile[] = [];
  public mKeyMenuItems: MenuItem[] = [
    {
      label: 'Scan',
      icon: 'pi pi-fw pi-qrcode',
      command: () => this.onScanKey(),
    },
    {
      label: 'Generate New',
      icon: 'pi pi-fw pi-refresh',
      command: () => this.onGenerateNewKey(),
    },
    {
      label: 'Share',
      icon: 'pi pi-fw pi-share-alt',
      command: () => this.onShareKey(),
    },
  ];
  private mCFCrypto: CFCrypto = new CFCrypto();
  public mShowCard = false;

  /////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(
    private mRouter: Router,
    private mChangeDetectorRef: ChangeDetectorRef,
    private mCFCameraService: CFCameraService,
    private mDialogService: DialogService,
    private mCFShareKeyService: CFShareKeyService,
    private mCFCoreEncodeService: CFCoreEncodeService,
    private mCFToastService: CFToastService,
    private mCFSettingsService: CFSettingsService,
    private mConfirmationService: ConfirmationService
  ) {
    this.mCFSettingsService.getPasswordSettings().then(tSetting => {
      this.mCipherforgePassLevel = tSetting;
    });

    setTimeout(() => {
      this.mShowCard = true;
      this.mChangeDetectorRef.markForCheck();
    }, 50);
  }

  /////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.mCFCrypto.terminate();
  }

  /////////////////////////////////////////////
  // ON FILE SELECTED
  async onFileSelected(tEvent: Event): Promise<void> {
    if (tEvent.target && (tEvent.target as HTMLInputElement).files) {
      const tFiles = (tEvent.target as HTMLInputElement).files;
      if (tFiles) {
        for (let f = 0; f < tFiles.length; f++) {
          const tFileContent = await CFFileHelper.readFileContentHasUint8Array(tFiles[f]);
          this.mFiles.push({
            name: tFiles[f].name,
            data: new Uint8Array(tFileContent),
          });
        }
      }
      this.mChangeDetectorRef.markForCheck();
    }
  }

  ///////////////////////////////////////////////////////////////
  // ON HEADER LOGO CLICKED
  onHeaderLogoClicked() {
    this.mRouter.navigate(['/']).then();
  }

  ///////////////////////////////////////////////////////////////
  // REMOVE FILE
  removeFile(tIndex: number) {
    this.mFiles.splice(tIndex, 1);
    this.mChangeDetectorRef.markForCheck();
  }

  ///////////////////////////////////////////////////////////////
  // ON KEY MENU CLICKED
  onKeyMenuClicked(tEvent: MouseEvent, tKeyContextMenu: ContextMenu) {
    tEvent.stopPropagation();
    tEvent.preventDefault();
    tKeyContextMenu.show(tEvent);
  }

  ///////////////////////////////////////////////////////////////
  // ON SCAN KEY
  private async onScanKey(): Promise<void> {
    const tScanResult = await this.mCFCameraService.scanQRCode('Scan Key QR Code', 'string');
    if (tScanResult.string) {
      const tKey = CFKeyHelper.checkKey({ hex: tScanResult.string });
      if (tKey.hex) {
        this.mKey = tKey.hex;
        this.mChangeDetectorRef.markForCheck();
      }
    }
  }

  ///////////////////////////////////////////////////////////////
  // ON GENERATE NEW KEY
  private async onGenerateNewKey(): Promise<void> {
    const tKey = await this.mCFCrypto.generateRandomKey();
    this.mKey = tKey.hex ?? '';
    this.mChangeDetectorRef.markForCheck();
    await this.onShareKey();
  }

  ///////////////////////////////////////////////////////////////
  // ON SHARE KEY
  private async onShareKey(): Promise<void> {
    const tKey = CFKeyHelper.checkKey({ hex: this.mKey });
    if (tKey.array) {
      await this.mCFShareKeyService.shareKey(tKey);
    }
  }

  ///////////////////////////////////////////////////////////////
  // ON PASSWORD SETTINGS CLICKED
  onPasswordSettingsClicked() {
    const tDialogRef = this.mDialogService.open(EncodePasswordSettingsComponent, {
      showHeader: true,
      header: 'Password Security',
      closeOnEscape: true,
      dismissableMask: true,
      data: {
        level: this.mCipherforgePassLevel,
      },
    });

    // ON CLOSE
    tDialogRef.onClose.subscribe(tValue => {
      if (tValue && tValue.level) {
        this.mCipherforgePassLevel = tValue.level;
        this.mCFSettingsService.setPasswordSettings(this.mCipherforgePassLevel).then();
      }
    });
  }

  ///////////////////////////////////////////////////////////////
  // CONTINUE ENCODING
  async continueEncoding(): Promise<void> {
    this.mUIState = 'working';
    this.mChangeDetectorRef.markForCheck();

    const tQRCodeEncodingOptions = await this.mCFSettingsService.getQRCodeEncodingOptions();
    const tOptions: CipherforgeEncodeOptions = {
      errorCorrection: tQRCodeEncodingOptions.errorCorrection,
      version: tQRCodeEncodingOptions.version,
    };

    if (this.mKey !== '') {
      tOptions.key = { hex: this.mKey };
    }

    if (this.mPassword !== '') {
      tOptions.password = {
        password: this.mPassword,
        level: this.mCipherforgePassLevel,
      };
    }

    const tError = await this.mCFCoreEncodeService.encode(this.mText, this.mFiles, tOptions);
    if (tError !== CipherforgeEncodeError.OK) {
      this.mUIState = 'form';
      this.mChangeDetectorRef.markForCheck();
      return;
    }

    const tChunkNumber = await this.mCFCoreEncodeService.getChunkNumber();
    if (tChunkNumber > 0) {
      this.mUIState = 'encoded';
      this.mChangeDetectorRef.markForCheck();
    } else {
      this.mCFToastService.showError('Error', 'Failed to encode', 5000);
      this.mUIState = 'form';
      this.mChangeDetectorRef.markForCheck();
    }
  }

  ///////////////////////////////////////////////////////////////
  // ENCODE CLICKED
  async onEncodeClicked(): Promise<void> {
    if (this.mPassword === '' && this.mKey === '') {
      this.mConfirmationService.confirm({
        message:
          'You are about to encode data without a key or password, resulting in unencrypted data. This means your information will not be secure. Do you want to proceed?',
        header: 'Alert',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Continue',
        rejectLabel: 'Cancel',
        accept: () => {
          this.continueEncoding();
        },
      });
    } else {
      this.continueEncoding().then();
    }
  }
}
