/* eslint-disable */

import { TestBed } from '@angular/core/testing';

import { CFCoreEncodeService } from './cf-core-encode.service';
import {
  CFErrorCorrectionLevel,
  CFQRCodeVersion,
  CIPHER_FORGE_CHUNK_HEADER_SIZE,
  CipherforgeEncodeError,
  CipherforgeFile,
} from '../cipherforge.types';
import { TestHelper } from '../../shared/_mocks/test.helper';

interface TMPCheck {
  s: number;
  v: CFQRCodeVersion;
  e: CFErrorCorrectionLevel;
}

describe('CFCoreEncodeService', () => {
  let mSrvEncode: CFCoreEncodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CFCoreEncodeService],
    });
    mSrvEncode = TestBed.inject(CFCoreEncodeService);
  });

  ///////////////////////////////////////////////////////////
  // SHOULD BE CREATED
  it('should be created', () => {
    expect(mSrvEncode).toBeTruthy();
  });

  ///////////////////////////////////////////////////////////
  // CALCULATE MAX DATA SIZE
  it('calculate max data size', async () => {
    const tChecks: TMPCheck[] = [
      { v: '10', e: 'L', s: 271 },
      { v: '10', e: 'M', s: 213 },
      { v: '10', e: 'Q', s: 151 },
      { v: '10', e: 'H', s: 119 },
      { v: '20', e: 'L', s: 858 },
      { v: '20', e: 'M', s: 666 },
      { v: '20', e: 'Q', s: 482 },
      { v: '20', e: 'H', s: 382 },
      { v: '30', e: 'L', s: 1732 },
      { v: '30', e: 'M', s: 1370 },
      { v: '30', e: 'Q', s: 982 },
      { v: '30', e: 'H', s: 742 },
      { v: '40', e: 'L', s: 2953 },
      { v: '40', e: 'M', s: 2331 },
      { v: '40', e: 'Q', s: 1663 },
      { v: '40', e: 'H', s: 1273 },
    ];

    for (const tCheck of tChecks) {
      // @ts-ignore
      mSrvEncode.mCipherforgeEncodeOptions = {
        version: tCheck.v,
        errorCorrection: tCheck.e,
      };

      // @ts-ignore
      mSrvEncode.calculateMaxQRCodeDataSize();

      // @ts-ignore
      expect(mSrvEncode.mMaxQRCodeData).toEqual(tCheck.s - CIPHER_FORGE_CHUNK_HEADER_SIZE - 2);
      // WE REMOVE FROM THE SIZE CIPHER_FORGE_CHUNK_HEADER_SIZE AND THE UINT32 FOR THE CHUNK NUMBER
    }
  });

  ///////////////////////////////////////////////////////////
  // TO MANY FILES
  it('to many files', async () => {
    const tFiles: CipherforgeFile[] = [];
    for (let f = 0; f < 257; f++) {
      tFiles.push({
        name: 'file-' + f.toString(),
        data: new Uint8Array([0]),
      });
    }

    const tEncResp = await mSrvEncode.encode('', tFiles, {
      version: '40',
      errorCorrection: 'L',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.TO_MANY_FILES);
  });

  ///////////////////////////////////////////////////////////
  // FILENAME TO BIG
  it('file name to big', async () => {
    const tFiles: CipherforgeFile[] = [
      {
        name: TestHelper.generateRandomString(300),
        data: new Uint8Array([0]),
      },
    ];

    const tEncResp = await mSrvEncode.encode('', tFiles, {
      version: '40',
      errorCorrection: 'L',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.FILENAME_TO_BIG);
  });

  ///////////////////////////////////////////////////////////
  // BAD ENCRYPT KEY HEX
  it('bad encrypt key hex', async () => {
    const tEncResp = await mSrvEncode.encode('Hello', [], {
      version: '40',
      errorCorrection: 'L',
      key: {
        hex: '8ca2550f35770436b4cb61653ef',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.ENCRYPTING_DATA);
  });

  ///////////////////////////////////////////////////////////
  // BAD ENCRYPT KEY
  it('bad encrypt key length', async () => {
    const tEncResp = await mSrvEncode.encode('Hello', [], {
      version: '40',
      errorCorrection: 'L',
      key: {
        array: new Uint8Array([0, 1]),
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.ENCRYPTING_DATA);
  });

  ///////////////////////////////////////////////////////////
  // BAD ENCRYPT KEY WITH PASSWORD
  it('bad encrypt key length', async () => {
    const tEncResp = await mSrvEncode.encode('Hello', [], {
      version: '40',
      errorCorrection: 'L',
      key: {
        array: new Uint8Array([0, 1]),
      },
      password: {
        level: { ops: 1, mem: 1 },
        password: '',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.ENCRYPTING_DATA);
  });
});
