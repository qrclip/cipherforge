import { Injectable, OnDestroy } from '@angular/core';
import { CF_CRYPTO_KEY_BYTES, CFCrypto } from '../objects/cf-crypto';
import {
  CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_INDEX_OVERFLOW,
  CF_ADD_QRCODE_DECODE_DATA_ERROR_NOT_READY,
  CF_ADD_QRCODE_DECODE_DATA_ERROR_SIZE,
  CF_ADD_QRCODE_DECODE_DATA_WARNING_ALREADY_EXISTS,
  CIPHER_FORGE_CHUNK_HEADER_SIG,
  CIPHER_FORGE_CHUNK_HEADER_SIZE,
  CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH,
  CIPHER_FORGE_SIGNATURE,
  CIPHER_FORGE_SIGNATURE_LENGTH,
  CipherforgeAddQRCodeDataResult,
  CipherforgeDecoded,
  CipherforgeDecodeData,
  CipherforgeDecodeDataChunk,
  CipherforgeDecodeDataReady,
  CipherforgeDecodedError,
  CipherforgeDecodeResult,
  CipherforgeDecodeResultError,
  CipherforgeFile,
  CipherforgeMode,
  CipherforgeStatus,
} from '../cipherforge.types';
import { CipherforgeKey } from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';
import { CFArrayHelper } from '../../shared/helpers/cf-array.helper';
import * as fflate from 'fflate';
import { CF_VERSION } from '../cf-constants';
import { CFKeyHelper } from '../objects/cf-key.helper';

@Injectable()
export class CFCoreDecodeService implements OnDestroy {
  private readonly mCFCrypto: CFCrypto = new CFCrypto();
  mCipherforgeDecodeData: CipherforgeDecodeData | null = null;

  ///////////////////////////////////////////////////////
  // ON DESTROY
  ngOnDestroy(): void {
    this.mCFCrypto.terminate();
  }

  //////////////////////////////////////////////////////
  // SET DECODE KEY
  public async setDecodeKey(tKey: CipherforgeKey): Promise<boolean> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData) {
      return false;
    }

    this.mCipherforgeDecodeData.key = CFKeyHelper.checkKey(tKey);

    // RETURN TRUE ONLY IF ARRAY AND HEX IS PRESENT AND THE SIZE IS CORRECT
    if (
      this.mCipherforgeDecodeData.key.array &&
      this.mCipherforgeDecodeData.key.hex &&
      this.mCipherforgeDecodeData.key.array.length === CF_CRYPTO_KEY_BYTES
    ) {
      return true;
    } else {
      this.mCipherforgeDecodeData.key = undefined;
      return false;
    }
  }

  //////////////////////////////////////////////////////
  // SET DECODE PASSWORD
  public async setDecodePassword(tPassword: string): Promise<boolean> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData || !this.mCipherforgeDecodeData.passOptions) {
      return false;
    }
    this.mCipherforgeDecodeData.passOptions.password = tPassword;
    return true;
  }

  //////////////////////////////////////////////////////
  // CHECK DECODE DATA READY
  public checkDecodeDataReady(): CipherforgeDecodeDataReady {
    // NO DECODE DATA
    if (!this.mCipherforgeDecodeData) {
      return CipherforgeDecodeDataReady.NO_DECODE_DATA;
    }

    // CHUNKS MISSING
    if (this.mCipherforgeDecodeData.chunkCount !== this.mCipherforgeDecodeData.chunks.length) {
      return CipherforgeDecodeDataReady.CHUNKS_MISSING;
    }

    // NO KEY DATA
    if (
      this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY ||
      this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY_AND_PASSWORD
    ) {
      if (!this.mCipherforgeDecodeData.key) {
        return CipherforgeDecodeDataReady.NO_KEY;
      }
    }

    // NO PASSWORD DATA
    if (
      this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY_AND_PASSWORD ||
      this.mCipherforgeDecodeData.mode === CipherforgeMode.PASSWORD_ONLY
    ) {
      if (!this.mCipherforgeDecodeData.passOptions || !this.mCipherforgeDecodeData.passOptions.password) {
        return CipherforgeDecodeDataReady.NO_PASSWORD;
      }
    }

    return CipherforgeDecodeDataReady.OK;
  }

  //////////////////////////////////////////////////////
  // GET DECODED DATA HAS TEXT
  public async getDecodedData(): Promise<CipherforgeDecoded> {
    const tCipherforgeDecoded: CipherforgeDecoded = {};

    if (!this.mCipherforgeDecodeData) {
      tCipherforgeDecoded.error = CipherforgeDecodedError.NO_DECODE_DATA;
      return tCipherforgeDecoded;
    }

    // MERGE ALL THE CHUNKS
    let tDataArray = await this.mergeDecodedData();
    if (!tDataArray) {
      tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_MERGE_DATA;
      return tCipherforgeDecoded;
    }

    // DECRYPT WITH KEY ONLY
    if (
      this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY &&
      this.mCipherforgeDecodeData.key &&
      this.mCipherforgeDecodeData.key.array
    ) {
      tDataArray = await this.mCFCrypto.decryptBuffer(
        new Uint8Array(tDataArray), // SINCE ITS TRANSFERRED IT WOULD DELETE IT
        this.mCipherforgeDecodeData.key.array
      );
    }

    // DECRYPT WITH PASSWORD
    if (this.mCipherforgeDecodeData.passOptions) {
      // DECRYPT WITH KEY AND PASSWORD
      if (
        this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY_AND_PASSWORD &&
        this.mCipherforgeDecodeData.key &&
        this.mCipherforgeDecodeData.key.array &&
        tDataArray
      ) {
        const tCipherforgeKey = await this.mCFCrypto.generateKeyFromPasswordAndKey(
          this.mCipherforgeDecodeData.key.array,
          this.mCipherforgeDecodeData.passOptions
        );
        /* istanbul ignore else: just in case no reason for error */
        if (tCipherforgeKey && !tCipherforgeKey.error && tCipherforgeKey.array) {
          tDataArray = await this.mCFCrypto.decryptBuffer(new Uint8Array(tDataArray), tCipherforgeKey.array);
          if (!tDataArray) {
            tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_DECRYPT_DATA;
            return tCipherforgeDecoded;
          }
        } else {
          tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_CREATE_KEY;
          return tCipherforgeDecoded;
        }
      }

      // DECRYPT WITH PASSWORD ONLY
      if (this.mCipherforgeDecodeData.mode === CipherforgeMode.PASSWORD_ONLY && tDataArray) {
        const tFinalKey = await this.mCFCrypto.generateKeyFromPassword(this.mCipherforgeDecodeData.passOptions);
        /* istanbul ignore else: just in case no reason for error */
        if (tFinalKey && tFinalKey.array && !tFinalKey.error) {
          tDataArray = await this.mCFCrypto.decryptBuffer(new Uint8Array(tDataArray), tFinalKey.array);
        } else {
          tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_CREATE_KEY;
          return tCipherforgeDecoded;
        }
      }
    }

    // CHECK IF DATA OK
    if (!tDataArray) {
      tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_DECODE_DATA;
      return tCipherforgeDecoded;
    }

    // REVERSE THE RANDOM OFFSET
    const offsetValue = (tDataArray[0] << 8) | tDataArray[1];
    tDataArray = CFArrayHelper.offsetArray(tDataArray.subarray(2), -offsetValue);

    // DECOMPRESS THE DATA
    tDataArray = this.decompressArray(tDataArray);
    if (!tDataArray) {
      tCipherforgeDecoded.error = CipherforgeDecodedError.FAILED_TO_DECOMPRESS_DATA;
      return tCipherforgeDecoded;
    }

    // PREPARE THE DATA VIEW TO GET VARIABLES
    const tDataView = new DataView(tDataArray.buffer);

    /*
    (4) UINT32    |   Text Size
    (*) ARRAY     |   Text Array
    (1) UINT8     |   File Count
     */

    // GET THE TEXT
    const tTextSize = tDataView.getUint32(0);
    if (tTextSize > 0) {
      tCipherforgeDecoded.text = CFArrayHelper.arrayToString(tDataArray.subarray(4, 4 + tTextSize));
    }

    // GET THE FILE COUNT
    const tFileCount = tDataView.getUint8(4 + tTextSize);

    // FOR EACH FILE
    /*
    (2) UINT16    |   Filename Size
    (*) ARRAY     |   Filename Array
    (4) UINT32    |   File Array Size
    (*) ARRAY     |   File content Array
     */
    let tFileOffset = 4 + tTextSize + 1;
    if (tFileCount > 0) {
      tCipherforgeDecoded.files = [];
      for (let f = 0; f < tFileCount; f++) {
        const tFilenameSize = tDataView.getUint16(tFileOffset, true);
        const tFileContentSize = tDataView.getUint32(tFileOffset + 2 + tFilenameSize, true);

        const tCipherforgeFile: CipherforgeFile = {
          name: CFArrayHelper.arrayToString(tDataArray.subarray(tFileOffset + 2, tFileOffset + 2 + tFilenameSize)),
          data: tDataArray.subarray(
            tFileOffset + 2 + tFilenameSize + 4,
            tFileOffset + 2 + tFilenameSize + 4 + tFileContentSize
          ),
        };
        tCipherforgeDecoded.files.push(tCipherforgeFile);
        tFileOffset = tFileOffset + 2 + tFilenameSize + 4 + tFileContentSize;
      }
    }

    return tCipherforgeDecoded;
  }

  //////////////////////////////////////////////////////
  // MERGE DECODED DATA
  private async mergeDecodedData(): Promise<Uint8Array | null> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData) {
      return null;
    }

    // IF DATA NOT OK RETURN NULL
    if (this.checkDecodeDataReady() !== CipherforgeDecodeDataReady.OK) {
      return null;
    }

    // FIRST SORT THE ARRAY BY INDEX IF SOMETHING IS WRONG GIVES AN EMPTY ARRAY
    this.mCipherforgeDecodeData.chunks = this.sortAndValidateChunks(this.mCipherforgeDecodeData.chunks);
    if (this.mCipherforgeDecodeData.chunks.length <= 0) {
      return null;
    }

    // JOIN ALL THE DATA
    let tMergedData = this.mCipherforgeDecodeData.chunks[0].data;
    for (let i = 1; i < this.mCipherforgeDecodeData.chunks.length; i++) {
      tMergedData = CFArrayHelper.joinArray(tMergedData, this.mCipherforgeDecodeData.chunks[i].data);
    }
    return tMergedData;
  }

  //////////////////////////////////////////////////////
  // SORT AND VALIDATE CHUNKS
  private sortAndValidateChunks(tChunks: CipherforgeDecodeDataChunk[]): CipherforgeDecodeDataChunk[] {
    // SORT BY INDEX
    tChunks.sort((a, b) => a.index - b.index);

    // CHECK IF INDEX ARE SEQUENTIAL
    for (let i = 0; i < tChunks.length; i++) {
      if (tChunks[i].index !== i) {
        return []; // RETURN EMPTY ARRAY IF NOT SEQUENTIAL
      }
    }

    return tChunks;
  }

  //////////////////////////////////////////////////////
  // DECOMPRESS ARRAY
  private decompressArray(compressedArray: Uint8Array): Uint8Array | null {
    try {
      return fflate.inflateSync(compressedArray);
    } catch (e) {
      return null;
    }
  }

  //////////////////////////////////////////////////////
  // DECODE QRCODE DATA
  private async addFirstQRCodeDecodeData(tArray: Uint8Array): Promise<CipherforgeDecodeResult> {
    const tCipherforgeDecodeResult: CipherforgeDecodeResult = {};

    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData) {
      tCipherforgeDecodeResult.error = CipherforgeDecodeResultError.NOT_ENOUGH_DATA;
      return tCipherforgeDecodeResult;
    }

    // READ HEADER
    if (tArray.length < 9) {
      tCipherforgeDecodeResult.error = CipherforgeDecodeResultError.NOT_ENOUGH_DATA;
      return tCipherforgeDecodeResult;
    }

    // NOTE: SIGNATURE IS ALREADY CHECKED

    const tVersion = +tArray.subarray(3, 4);
    if (tVersion > CF_VERSION) {
      tCipherforgeDecodeResult.error = CipherforgeDecodeResultError.HIGHER_VERSION;
      return tCipherforgeDecodeResult;
    }

    const tMode = +tArray.subarray(4, 5);

    // READ THE HEADER PARAMETERS
    const tDataView = new DataView(tArray.buffer);
    const tChunkCount = tDataView.getUint32(5, true);

    this.mCipherforgeDecodeData.chunkCount = tChunkCount;
    this.mCipherforgeDecodeData.mode = tMode;
    this.mCipherforgeDecodeData.version = tVersion;
    // CHECK IF THE CHUNK INDEX OVERFLOW
    for (const tChunk of this.mCipherforgeDecodeData.chunks) {
      if (tChunk.index >= tChunkCount) {
        tCipherforgeDecodeResult.error = CipherforgeDecodeResultError.EXISTING_CHUNKS_OVERFLOW;
        return tCipherforgeDecodeResult;
      }
    }

    let tDataOffset = 9;

    // IN CASE IT HAS PASSWORD READ THE PARAMETERS
    if (
      this.mCipherforgeDecodeData.mode === CipherforgeMode.KEY_AND_PASSWORD ||
      this.mCipherforgeDecodeData.mode === CipherforgeMode.PASSWORD_ONLY
    ) {
      if (tArray.length >= tDataOffset + CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH + 1 + 1) {
        this.mCipherforgeDecodeData.passOptions = {
          salt: tArray.subarray(tDataOffset, tDataOffset + CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH),
          level: {
            ops: tArray[tDataOffset + CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH],
            mem: tArray[tDataOffset + CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH + 1],
          },
        };
        tDataOffset += CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH + 1 + 1;
      } else {
        tCipherforgeDecodeResult.error = CipherforgeDecodeResultError.NO_VALID_PASSWORD_DATA;
        return tCipherforgeDecodeResult;
      }
    }

    // ADD THE FIRST CHUNK
    const tFirstChunk: CipherforgeDecodeDataChunk = {
      index: 0,
      data: tArray.subarray(tDataOffset),
    };
    this.mCipherforgeDecodeData.chunks.push(tFirstChunk);

    // SET THE DATA
    tCipherforgeDecodeResult.data = {
      version: this.mCipherforgeDecodeData.version,
      chunkCount: this.mCipherforgeDecodeData.chunkCount,
      mode: this.mCipherforgeDecodeData.mode,
    };
    return tCipherforgeDecodeResult;
  }

  //////////////////////////////////////////////////////
  // ADD QRCODE DECODE DATA
  private async addChunkQRCodeDecodeData(tDataArray: Uint8Array): Promise<number> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData) {
      return CF_ADD_QRCODE_DECODE_DATA_ERROR_NOT_READY;
    }

    if (tDataArray.length < CIPHER_FORGE_CHUNK_HEADER_SIZE) {
      return CF_ADD_QRCODE_DECODE_DATA_ERROR_SIZE;
    }

    // NOTE: SIGNATURE WAS ALREADY CHECKED

    // GET THE INDEX OF THE CHUNK
    const tDataView = new DataView(tDataArray.buffer);
    const tChunkIndex = tDataView.getUint32(CIPHER_FORGE_CHUNK_HEADER_SIG.length, true);

    // IF THE CHUNK INDEX DOES NOT BELONG TO THE INTERVAL
    if (this.mCipherforgeDecodeData.chunkCount >= 0 && tChunkIndex >= this.mCipherforgeDecodeData.chunkCount) {
      return CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_INDEX_OVERFLOW;
    }

    // CHECK IF ALREADY THERE
    for (const tChunk of this.mCipherforgeDecodeData.chunks) {
      if (tChunk.index === tChunkIndex) {
        return CF_ADD_QRCODE_DECODE_DATA_WARNING_ALREADY_EXISTS;
      }
    }

    // IF EVERYTHING IS OK
    this.mCipherforgeDecodeData.chunks.push({
      index: tChunkIndex,
      data: tDataArray.subarray(CIPHER_FORGE_CHUNK_HEADER_SIZE),
    });
    return tChunkIndex;
  }

  //////////////////////////////////////////////////////
  // ADD QR CODE DECODE DATA V2
  public async addQRCodeDecodeData(tDataArray: Uint8Array): Promise<CipherforgeAddQRCodeDataResult> {
    /* istanbul ignore next: defensive */
    if (!this.mCipherforgeDecodeData) {
      this.mCipherforgeDecodeData = {
        chunkCount: -1,
        mode: CipherforgeMode.NONE,
        version: 0,
        chunks: [],
      };
    }

    // DETECT IF CHUNK OR THE FIRST
    const tSignature = CFArrayHelper.arrayToString(tDataArray.subarray(0, CIPHER_FORGE_SIGNATURE_LENGTH));

    if (tSignature === CIPHER_FORGE_CHUNK_HEADER_SIG) {
      return { chunk: await this.addChunkQRCodeDecodeData(tDataArray) };
    }

    if (tSignature === CIPHER_FORGE_SIGNATURE) {
      if (this.mCipherforgeDecodeData.chunkCount > 0) {
        return {}; // IF FIRST ALREADY THERE
      }
      return { first: await this.addFirstQRCodeDecodeData(tDataArray) };
    }

    return { error: true };
  }

  //////////////////////////////////////////////////////
  // GET STATUS
  public async getStatus(): Promise<CipherforgeStatus> {
    const tCipherforgeStatus: CipherforgeStatus = {
      chunkCount: 0,
      chunks: [],
    };

    if (this.mCipherforgeDecodeData) {
      tCipherforgeStatus.chunkCount = this.mCipherforgeDecodeData.chunkCount;
      for (const tChunk of this.mCipherforgeDecodeData.chunks) {
        tCipherforgeStatus.chunks.push(tChunk.index);
      }
    }

    return tCipherforgeStatus;
  }

  //////////////////////////////////////////////////////
  // GET DECODE MODE
  public getDecodeMode(): CipherforgeMode {
    return this.mCipherforgeDecodeData?.mode ?? CipherforgeMode.EMPTY;
  }
}
