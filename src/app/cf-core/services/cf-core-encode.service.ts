import { Injectable, OnDestroy } from '@angular/core';
import {
  CFErrorCorrectionLevel,
  CFQRCodeVersion,
  CIPHER_FORGE_CHUNK_HEADER_SIG,
  CIPHER_FORGE_CHUNK_HEADER_SIZE,
  CIPHER_FORGE_SIGNATURE,
  CIPHER_FORGE_VERSION,
  CipherforgeEncodeData,
  CipherforgeEncodedChunk,
  CipherforgeEncodeError,
  CipherforgeEncodeOptions,
  CipherforgeFile,
  CipherforgeMode,
  CipherforgeOptionsPassword,
} from '../cipherforge.types';
import { CFArrayHelper } from '../../shared/helpers/cf-array.helper';
import { CFCrypto } from '../objects/cf-crypto';
import * as fflate from 'fflate';
import { CipherforgeKey } from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';
import { CFSettingsService } from './cf-settings.service';
import { CFKeyHelper } from '../objects/cf-key.helper';

@Injectable()
export class CFCoreEncodeService implements OnDestroy {
  private readonly mCFCrypto: CFCrypto = new CFCrypto();
  private mCipherforgeEncodeData: CipherforgeEncodeData | null = null;
  private mMaxQRCodeData = 0;
  private mCipherforgeEncodeOptions: CipherforgeEncodeOptions | null = null;

  ///////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mCFSettingsService: CFSettingsService) {}

  ///////////////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.mCFCrypto.terminate();
  }

  //////////////////////////////////////////////////////
  // ENCODE
  public async encode(
    tText: string,
    tFiles: CipherforgeFile[],
    tOptions: CipherforgeEncodeOptions
  ): Promise<CipherforgeEncodeError> {
    // IF MORE THAN 255 FILES SHOW ERROR ( 1 Byte )
    if (tFiles.length > 255) {
      return CipherforgeEncodeError.TO_MANY_FILES;
    }
    this.mCipherforgeEncodeOptions = tOptions;

    // CALCULATE THE DATA PER QR CODE
    this.calculateMaxQRCodeDataSize();

    // CONVERT THE STRING TO AN ARRAY
    const tTextData = CFArrayHelper.stringToArray(tText);

    // START BUILDING THE FINAL DATA ARRAY
    /*
    (4) UINT32    |   Text Size
    (*) ARRAY     |   Text Array
    (1) UINT8     |   File Count
     */
    // (4) Text size + (Actual Text Length) + (1) File count
    let tDataArray = new Uint8Array(4 + tTextData.length + 1);
    const tDataView = new DataView(tDataArray.buffer);
    // THE TEXT SIZE
    tDataView.setUint32(0, tTextData.length);
    // SET THE TEXT DATA ARRAY
    tDataArray.set(tTextData, 4);
    // THE FILE COUNT
    tDataView.setUint8(4 + tTextData.length, tFiles.length);

    // FOR EACH FILE
    /*
    (2) UINT16    |   Filename Size
    (*) ARRAY     |   Filename Array
    (4) UINT32    |   File Array Size
    (*) ARRAY     |   File content Array
     */
    for (const tFile of tFiles) {
      const tFilenameArray = CFArrayHelper.stringToArray(tFile.name);
      if (tFilenameArray.length > 255) {
        return CipherforgeEncodeError.FILENAME_TO_BIG;
      }
      const tFileData = new Uint8Array(2 + tFilenameArray.length + 4 + tFile.data.length);
      const tFileDataView = new DataView(tFileData.buffer);
      tFileDataView.setUint16(0, tFilenameArray.length, true); // FILE NAME SIZE
      tFileData.set(tFilenameArray, 2); // THE ACTUAL FILENAME
      tFileDataView.setUint32(2 + tFilenameArray.length, tFile.data.length, true); // FILE NAME SIZE
      tFileData.set(tFile.data, 2 + tFilenameArray.length + 4); // THE FILE CONTENT
      tDataArray = CFArrayHelper.joinArray(tDataArray, tFileData); // ADD TO THE MAIN DATA
    }

    // GENERATE A RANDOM OFFSET, COMPRESS THE DATA AND OFFSET THE COMPRESSED DATA
    const tRandomOffset = this.generateRandomOffset();
    const tCompressedAndOffsetData = CFArrayHelper.offsetArray(this.compressArray(tDataArray), tRandomOffset);

    // FINAL DATA ARRAY = OFFSET VALUE ( UINT16 ) + COMPRESSED DATA ARRAY
    const tFinalDataArray = new Uint8Array(2 + tCompressedAndOffsetData.length);
    const tFinalDataView = new DataView(tFinalDataArray.buffer);
    tFinalDataView.setUint16(0, tRandomOffset); // RANDOM OFFSET
    tFinalDataArray.set(tCompressedAndOffsetData, 2);

    return this.prepareData(tFinalDataArray, tOptions);
  }

  //////////////////////////////////////////////////////
  // CHANGE ENCODE OPTIONS
  public async changeEncodeOptions(tVersion: CFQRCodeVersion, tErrorCorrection: CFErrorCorrectionLevel): Promise<void> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeEncodeOptions) {
      return;
    }
    await this.mCFSettingsService.setQRCodeEncodingOptions({
      version: tVersion,
      errorCorrection: tErrorCorrection,
    });
    this.mCipherforgeEncodeOptions.version = tVersion;
    this.mCipherforgeEncodeOptions.errorCorrection = tErrorCorrection;
    this.calculateMaxQRCodeDataSize();
    this.updateChunkCount();
  }

  //////////////////////////////////////////////////////
  // GENERATE RANDOM OFFSET
  private generateRandomOffset(): number {
    // Create a random 16-bit integer
    // Note: Math.random() returns a value between 0 (inclusive) and 1 (exclusive)
    // We multiply it by 0xFFFF (65535 in decimal) to get a range from 0 to 65534
    // We use Math.floor to ensure we get an integer value
    return Math.floor(Math.random() * 0xffff);
  }

  //////////////////////////////////////////////////////
  // GET CHUNK NUMBER
  public async getChunkNumber(): Promise<number> {
    if (!this.mCipherforgeEncodeData) {
      return 0;
    }
    return this.mCipherforgeEncodeData.chunkCount;
  }

  //////////////////////////////////////////////////////
  // GET CHUNK DATA
  public async getChunkData(tChunkNo: number): Promise<CipherforgeEncodedChunk> {
    const tCipherforgeEncodedChunk: CipherforgeEncodedChunk = {
      data: new Uint8Array(0),
      version: this.mCipherforgeEncodeOptions?.version ?? '40',
      errorCorrection: this.mCipherforgeEncodeOptions?.errorCorrection ?? 'M',
    };

    if (!this.mCipherforgeEncodeData || !this.mCipherforgeEncodeData.dataArray) {
      return tCipherforgeEncodedChunk;
    }

    const tOffset = tChunkNo * this.mMaxQRCodeData;
    tCipherforgeEncodedChunk.data = this.mCipherforgeEncodeData.dataArray.subarray(
      tOffset,
      tOffset + this.mMaxQRCodeData
    );

    // ONLY DO THIS FOR CHUNKS AFTER THE FIRST, IT IS A SMALL CHUNK SIGNATURE AND A, THE CHUNK INDEX
    if (tChunkNo > 0) {
      // NOW PREPEND A SIG AND INDEX
      const tChunkHeader = new Uint8Array(CIPHER_FORGE_CHUNK_HEADER_SIZE);
      tChunkHeader.set(CFArrayHelper.stringToArray(CIPHER_FORGE_CHUNK_HEADER_SIG), 0);
      const tDataView = new DataView(tChunkHeader.buffer);
      tDataView.setUint32(CIPHER_FORGE_CHUNK_HEADER_SIG.length, tChunkNo, true);
      tCipherforgeEncodedChunk.data = CFArrayHelper.joinArray(tChunkHeader, tCipherforgeEncodedChunk.data);
    }

    return tCipherforgeEncodedChunk;
  }

  //////////////////////////////////////////////////////
  // PREPARE DATA
  private async prepareData(
    tBaseData: Uint8Array,
    tOptions: CipherforgeEncodeOptions
  ): Promise<CipherforgeEncodeError> {
    this.mCipherforgeEncodeData = {
      mode: CipherforgeMode.NONE,
      chunkCount: 0,
    };

    // FIND THE DATA MODE
    this.mCipherforgeEncodeData.mode = this.getEncodeDataModeFromOptions(tOptions);

    // CREATE HEADER
    let tHeader = await this.createHeader(this.mCipherforgeEncodeData.mode);

    // IF ONLY HEX SUPPLY CONVERT TO ARRAY
    if (tOptions.key) {
      tOptions.key = CFKeyHelper.checkKey(tOptions.key);
      if (!tOptions.key.array) {
        return CipherforgeEncodeError.ENCRYPTING_DATA;
      }
    }

    // KEY ONLY
    if (this.mCipherforgeEncodeData.mode === CipherforgeMode.KEY && tOptions.key && tOptions.key.array) {
      const tEncData = await this.mCFCrypto.encryptBuffer(tBaseData, tOptions.key.array);
      /* istanbul ignore else */
      if (tEncData) {
        tBaseData = tEncData;
      } else {
        return CipherforgeEncodeError.ENCRYPTING_DATA;
      }
    }

    // IF PASSWORD MODES (KEY_AND_PASSWORD, PASSWORD_ONLY)
    if (
      (this.mCipherforgeEncodeData.mode === CipherforgeMode.KEY_AND_PASSWORD ||
        this.mCipherforgeEncodeData.mode === CipherforgeMode.PASSWORD_ONLY) &&
      tOptions.password
    ) {
      // GENERATE THE SALT AND APPEND THE SECURITY LEVEL TO THE HEADER
      tOptions.password.salt = await this.mCFCrypto.generateRandomPasswordSalt();
      tHeader = this.appendPasswordDataToHeader(tHeader, tOptions.password);

      let tKey: CipherforgeKey = {};

      // RANDOM KEY AND PASSWORD
      if (this.mCipherforgeEncodeData.mode === CipherforgeMode.KEY_AND_PASSWORD && tOptions.key && tOptions.key.array) {
        tKey = await this.mCFCrypto.generateKeyFromPasswordAndKey(tOptions.key.array, tOptions.password);
      }

      // ONLY PASSWORD
      if (this.mCipherforgeEncodeData.mode === CipherforgeMode.PASSWORD_ONLY) {
        tKey = await this.mCFCrypto.generateKeyFromPassword(tOptions.password);
      }
      /* istanbul ignore else */
      if (tKey && tKey.array && !tKey.error) {
        const tEncData = await this.mCFCrypto.encryptBuffer(tBaseData, tKey.array);
        /* istanbul ignore else: impossible to get to the else but nonetheless :) */
        if (tEncData) {
          tBaseData = tEncData;
        } else {
          return CipherforgeEncodeError.ENCRYPTING_DATA;
        }
      } else {
        return CipherforgeEncodeError.ENCRYPTING_DATA;
      }
    }

    // JOIN THE HEADER WITH THE DATA
    this.mCipherforgeEncodeData.dataArray = CFArrayHelper.joinArray(tHeader, tBaseData);

    // UPDATE THE CHUNK COUNT
    this.updateChunkCount();

    return CipherforgeEncodeError.OK;
  }

  //////////////////////////////////////////////////////
  // UPDATE CHUNK COUNT
  private updateChunkCount(): void {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeEncodeData || !this.mCipherforgeEncodeData.dataArray) {
      return;
    }
    // CALCULATE THE CHUNK COUNT
    this.mCipherforgeEncodeData.chunkCount = Math.ceil(
      this.mCipherforgeEncodeData.dataArray.length / this.mMaxQRCodeData
    );

    // WRITE THE CORRECT CHUNK COUNT
    const tDataView = new DataView(this.mCipherforgeEncodeData.dataArray.buffer);
    tDataView.setUint32(5, this.mCipherforgeEncodeData.chunkCount, true);
  }

  //////////////////////////////////////////////////////
  // COMPRESS ARRAY
  private compressArray(inputArray: Uint8Array): Uint8Array {
    return fflate.deflateSync(inputArray, { level: 9 });
  }

  //////////////////////////////////////////////////////
  // CREATE HEADER
  private async createHeader(tMode: CipherforgeMode): Promise<Uint8Array> {
    /*
    (3) TEXT      |   Signature 'CFF'
    (1) UINT8     |   Version
    (1) UINT8     |   Mode (CipherforgeMode)
    (4) UINT32    |   CHUNK COUNT
     */
    const tHeader = new Uint8Array(CIPHER_FORGE_SIGNATURE.length + 1 + 1 + 4);
    tHeader.set(CFArrayHelper.stringToArray(CIPHER_FORGE_SIGNATURE), 0);
    tHeader.set([CIPHER_FORGE_VERSION, tMode, 0, 0, 0, 0], CIPHER_FORGE_SIGNATURE.length); // 0, 0, 0, 0 for UINT32 ( CHUNK COUNT)
    return tHeader;
  }

  //////////////////////////////////////////////////////
  // APPEND PASSWORD DATA TO HEADER
  private appendPasswordDataToHeader(tHeader: Uint8Array, tOptionsPass: CipherforgeOptionsPassword): Uint8Array {
    if (tOptionsPass.salt) {
      tHeader = CFArrayHelper.joinArray(tHeader, tOptionsPass.salt);
      tHeader = CFArrayHelper.joinArray(tHeader, new Uint8Array([tOptionsPass.level.ops, tOptionsPass.level.mem]));
    }
    return tHeader;
  }

  //////////////////////////////////////////////////////
  // GET ENCODE DATA MODE FROM OPTIONS
  private getEncodeDataModeFromOptions(tOptions: CipherforgeEncodeOptions): CipherforgeMode {
    // IF KEY AND PASS
    if (tOptions.key && tOptions.password) {
      return CipherforgeMode.KEY_AND_PASSWORD;
    } else {
      // KEY AND PASSWORD
      if (!tOptions.key && tOptions.password) {
        return CipherforgeMode.PASSWORD_ONLY;
      }
      // ONLY KEY
      if (tOptions.key) {
        return CipherforgeMode.KEY;
      }
    }
    return CipherforgeMode.NONE;
  }

  //////////////////////////////////////////////////////
  // CALCULATE MAX QR CODE DATA SIZE
  private calculateMaxQRCodeDataSize() {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeEncodeOptions) {
      return;
    }
    this.mMaxQRCodeData = 0;

    // 10
    if (this.mCipherforgeEncodeOptions.version === '10') {
      switch (this.mCipherforgeEncodeOptions.errorCorrection) {
        case 'L':
          this.mMaxQRCodeData = 271;
          break;
        case 'M':
          this.mMaxQRCodeData = 213;
          break;
        case 'Q':
          this.mMaxQRCodeData = 151;
          break;
        case 'H':
          this.mMaxQRCodeData = 119;
          break;
      }
    }

    // 20
    if (this.mCipherforgeEncodeOptions.version === '20') {
      switch (this.mCipherforgeEncodeOptions.errorCorrection) {
        case 'L':
          this.mMaxQRCodeData = 858;
          break;
        case 'M':
          this.mMaxQRCodeData = 666;
          break;
        case 'Q':
          this.mMaxQRCodeData = 482;
          break;
        case 'H':
          this.mMaxQRCodeData = 382;
          break;
      }
    }

    // 30
    if (this.mCipherforgeEncodeOptions.version === '30') {
      switch (this.mCipherforgeEncodeOptions.errorCorrection) {
        case 'L':
          this.mMaxQRCodeData = 1732;
          break;
        case 'M':
          this.mMaxQRCodeData = 1370;
          break;
        case 'Q':
          this.mMaxQRCodeData = 982;
          break;
        case 'H':
          this.mMaxQRCodeData = 742;
          break;
      }
    }

    // 40
    if (this.mCipherforgeEncodeOptions.version === '40') {
      switch (this.mCipherforgeEncodeOptions.errorCorrection) {
        case 'L':
          this.mMaxQRCodeData = 2953;
          break;
        case 'M':
          this.mMaxQRCodeData = 2331;
          break;
        case 'Q':
          this.mMaxQRCodeData = 1663;
          break;
        case 'H':
          this.mMaxQRCodeData = 1273;
          break;
      }
    }
    this.mMaxQRCodeData = this.mMaxQRCodeData - CIPHER_FORGE_CHUNK_HEADER_SIZE - 2; // SAFE MARGIN
  }

  //////////////////////////////////////////////////////
  // GET OPTIONS
  public getOptions(): CipherforgeEncodeOptions | null {
    return this.mCipherforgeEncodeOptions;
  }
}
