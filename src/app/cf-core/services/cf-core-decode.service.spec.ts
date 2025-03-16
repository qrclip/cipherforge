/* eslint-disable */

import { TestBed } from '@angular/core/testing';

import { CFCoreDecodeService } from './cf-core-decode.service';
import { CFCoreEncodeService } from './cf-core-encode.service';
import {
  CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_INDEX_OVERFLOW,
  CF_ADD_QRCODE_DECODE_DATA_ERROR_SIZE,
  CF_ADD_QRCODE_DECODE_DATA_WARNING_ALREADY_EXISTS,
  CIPHER_FORGE_CHUNK_HEADER_SIG,
  CipherforgeDecodeDataReady,
  CipherforgeDecodedError,
  CipherforgeDecodeResultError,
  CipherforgeEncodeError,
  CipherforgeMode,
} from '../cipherforge.types';
import { TestHelper } from '../../shared/_mocks/test.helper';
import { CFArrayHelper } from '../../shared/helpers/cf-array.helper';

describe('CFCoreDecodeService', () => {
  let mSrvDecode: CFCoreDecodeService;
  let mSrvEncode: CFCoreEncodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CFCoreDecodeService, CFCoreEncodeService],
    });
    mSrvDecode = TestBed.inject(CFCoreDecodeService);
    mSrvEncode = TestBed.inject(CFCoreEncodeService);
  });

  /////////////////////////////////////////////////////
  // CREATE
  it('should be created', () => {
    expect(mSrvDecode).toBeTruthy();
  });

  /////////////////////////////////////////////////////
  // SET BAD DECODE KEY
  it('set bad decode key', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data', [], {
      version: '40',
      errorCorrection: 'L',
      key: {
        hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_KEY);

    const tAddKeyRes1 = await mSrvDecode.setDecodeKey({ array: new Uint8Array([0, 0]) });
    expect(tAddKeyRes1).toEqual(false);

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_KEY);

    const tAddKeyRes2 = await mSrvDecode.setDecodeKey({
      hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
    });
    expect(tAddKeyRes2).toEqual(true);

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data');
  });

  /////////////////////////////////////////////////////
  // CHECK DECODE DATA
  it('check decode data on empty', async () => {
    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_DECODE_DATA);

    const tResp = await mSrvDecode.getDecodedData();
    expect(tResp.error).toEqual(CipherforgeDecodedError.NO_DECODE_DATA);
  });

  ///////////////////////////////////////////////////////////
  // FAIL TO MERGE DATA
  it('Cause Fail to merge data', async () => {
    const tText = TestHelper.generateRandomString(119 * 3);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tChunkNumber).toBeGreaterThan(1);

    // NOW WE HAVE MULTIPLE CHUNKS SO LETS FEED THEM TO THE DECODE ONE BY ONE
    for (let c = 0; c < tChunkNumber; c++) {
      const tChunk = await mSrvEncode.getChunkData(c);
      expect(tChunk.data.length).toBeGreaterThan(0);

      const tDecResp = await mSrvDecode.addQRCodeDecodeData(tChunk.data);
      if (c === 0) {
        expect(tDecResp.first).toBeDefined();
        expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.CHUNKS_MISSING);
      } else {
        expect(tDecResp.chunk).toEqual(c);
      }
    }

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    // NOW MESS WITH THE DATA
    mSrvDecode.mCipherforgeDecodeData?.chunks.pop();

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.error).toEqual(CipherforgeDecodedError.FAILED_TO_MERGE_DATA);
  });

  ///////////////////////////////////////////////////////////
  // ADD FIRST CHUNK AGAIN
  it('add first chunk again', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data 123', [], {
      version: '40',
      errorCorrection: 'L',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    const tDecResp2 = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp2.first).not.toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tStatus = await mSrvDecode.getStatus();
    expect(tStatus.chunkCount).toEqual(1);
    expect(tStatus.chunks.length).toEqual(1);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data 123');
  });

  ///////////////////////////////////////////////////////////
  // ADD BAD CHUNK
  it('add bad chunk', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data 123', [], {
      version: '40',
      errorCorrection: 'L',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);

    expect(mSrvDecode.getDecodeMode()).toEqual(CipherforgeMode.EMPTY);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    // ADD THE BAD CHUNK
    const tDecResp2 = await mSrvDecode.addQRCodeDecodeData(new Uint8Array([0, 1]));
    expect(tDecResp2.error).toEqual(true);

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    expect(mSrvDecode.getDecodeMode()).toEqual(CipherforgeMode.NONE);

    const tStatus = await mSrvDecode.getStatus();
    expect(tStatus.chunkCount).toEqual(1);
    expect(tStatus.chunks.length).toEqual(1);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data 123');
  });

  ///////////////////////////////////////////////////////////
  // FORCE ADD NEXT CHUNK ERROR
  it('force add next chunk error ( after first )', async () => {
    const tText = TestHelper.generateRandomString(119 * 3);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toBeGreaterThan(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    const tFirstResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tFirstResp.first).toBeDefined();

    // BAD CHUNK SIZE
    const tBadLengthResp = await mSrvDecode.addQRCodeDecodeData(CFArrayHelper.stringToArray('CFC'));
    expect(tBadLengthResp.chunk).toEqual(CF_ADD_QRCODE_DECODE_DATA_ERROR_SIZE);

    // BAD CHUNK INDEX
    const tDummyChunk = new Uint8Array(7);
    const tDataView = new DataView(tDummyChunk.buffer);
    tDataView.setUint32(CIPHER_FORGE_CHUNK_HEADER_SIG.length, 250, true);
    tDummyChunk.set(CFArrayHelper.stringToArray('CFC'), 0);

    const tBadChunkIndex = await mSrvDecode.addQRCodeDecodeData(tDummyChunk);
    expect(tBadChunkIndex.chunk).toEqual(CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_INDEX_OVERFLOW);

    const tSecondChunk = await mSrvEncode.getChunkData(1);
    const tSecondResp = await mSrvDecode.addQRCodeDecodeData(tSecondChunk.data);
    expect(tSecondResp.chunk).toEqual(1);

    const tSecondResp2 = await mSrvDecode.addQRCodeDecodeData(tSecondChunk.data);
    expect(tSecondResp2.chunk).toEqual(CF_ADD_QRCODE_DECODE_DATA_WARNING_ALREADY_EXISTS);
  });

  ///////////////////////////////////////////////////////////
  // FORCE ADD FIRST CHUNK ERRORS
  it('force add first chunk errors', async () => {
    let tAddResp = await mSrvDecode.addQRCodeDecodeData(CFArrayHelper.stringToArray('CFF'));
    expect(tAddResp.first!.error).toEqual(CipherforgeDecodeResultError.NOT_ENOUGH_DATA);

    // NOT ENOUGH DATA
    tAddResp = await mSrvDecode.addQRCodeDecodeData(CFArrayHelper.stringToArray('CFF1244'));
    expect(tAddResp.first!.error).toEqual(CipherforgeDecodeResultError.NOT_ENOUGH_DATA);

    // BAD CHUNK INDEX
    const tDummyChunk = new Uint8Array(20);
    const tDataView = new DataView(tDummyChunk.buffer);
    tDataView.setUint8(3, 255);
    tDummyChunk.set(CFArrayHelper.stringToArray('CFF'), 0);
    tAddResp = await mSrvDecode.addQRCodeDecodeData(tDummyChunk);
    expect(tAddResp.first!.error).toEqual(CipherforgeDecodeResultError.HIGHER_VERSION);
  });

  ///////////////////////////////////////////////////////////
  // FORCE CHUNK NUMBER OVERFLOW ON THE FIRST
  it('force add chunk number overflow on the first chunk', async () => {
    const tText = TestHelper.generateRandomString(119 * 3);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toBeGreaterThan(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    const tSecondChunk = await mSrvEncode.getChunkData(1);
    const tDataView = new DataView(tSecondChunk.data.buffer);
    tDataView.setUint32(3, 324, true);

    const tFirstResp = await mSrvDecode.addQRCodeDecodeData(tSecondChunk.data);
    expect(tFirstResp.chunk).toEqual(324);

    // BAD CHUNK SIZE
    const tFirstChunkResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tFirstChunkResp.first?.error).toEqual(CipherforgeDecodeResultError.EXISTING_CHUNKS_OVERFLOW);
  });

  ///////////////////////////////////////////////////////////
  // FORCE FIRST CHUNK NO PASSWORD DATA INFO
  it('force first chunk no password data info', async () => {
    const tEncResp = await mSrvEncode.encode('My ABC', [], {
      version: '10',
      errorCorrection: 'H',
      password: {
        level: {
          ops: 1,
          mem: 1,
        },
        password: 'MyPass',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toEqual(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);

    const tFirstResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data.subarray(0, 10));
    expect(tFirstResp.first?.error).toEqual(CipherforgeDecodeResultError.NO_VALID_PASSWORD_DATA);
  });

  ///////////////////////////////////////////////////////////
  // FORCE DECOMPRESS ERROR
  it('force decompress error', async () => {
    const tEncResp = await mSrvEncode.encode('My ABC', [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toEqual(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    const tDataView = new DataView(tFirstChunk.data.buffer);
    let tCurrentOffset = tDataView.getUint16(9, true);
    tCurrentOffset = tCurrentOffset + 2;
    if (tCurrentOffset > 65535) {
      tCurrentOffset = tCurrentOffset - 65535;
    }
    tDataView.setUint16(9, tCurrentOffset, true);

    const tFirstResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tFirstResp.first).toBeDefined();

    const tDecodedData = await mSrvDecode.getDecodedData();
    expect(tDecodedData.error).toEqual(CipherforgeDecodedError.FAILED_TO_DECOMPRESS_DATA);
  });

  ///////////////////////////////////////////////////////////
  // FAILED TO DECRYPT KEY
  it('force fail to decrypt key', async () => {
    const tEncResp = await mSrvEncode.encode('My ABC', [], {
      version: '10',
      errorCorrection: 'H',
      key: {
        hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
      },
      password: {
        level: {
          ops: 1,
          mem: 1,
        },
        password: 'MyPass',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toEqual(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);

    const tFirstResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tFirstResp.first).toBeDefined();

    await mSrvDecode.setDecodeKey({ hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420' });
    await mSrvDecode.setDecodePassword('MyPass2');

    const tDecodedData = await mSrvDecode.getDecodedData();
    expect(tDecodedData.error).toEqual(CipherforgeDecodedError.FAILED_TO_DECRYPT_DATA);
  });

  ///////////////////////////////////////////////////////////
  // FORCE CHUNK VALIDATION TO FAIL ( NO CHUNKS )
  it('force chunk validation to fail ( no chunks )', async () => {
    const tText = TestHelper.generateRandomString(119 * 4);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tChunkNumber).toBeGreaterThan(1);

    // NOW WE HAVE MULTIPLE CHUNKS SO LETS FEED THEM TO THE DECODE ONE BY ONE
    for (let c = 0; c < tChunkNumber; c++) {
      const tChunk = await mSrvEncode.getChunkData(c);
      expect(tChunk.data.length).toBeGreaterThan(0);

      const tDecResp = await mSrvDecode.addQRCodeDecodeData(tChunk.data);
      if (c === 0) {
        expect(tDecResp.first).toBeDefined();
        expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.CHUNKS_MISSING);
      } else {
        expect(tDecResp.chunk).toEqual(c);
      }
    }

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    // NOW DO THE DELETION OF THE CHUNKS
    mSrvDecode.mCipherforgeDecodeData!.chunks = [];

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.error).toEqual(CipherforgeDecodedError.FAILED_TO_MERGE_DATA);
  });

  ///////////////////////////////////////////////////////////
  // FORCE CHUNK VALIDATION TO FAIL ( MIX THE CHUNK ORDER )
  it('force chunk validation to fail ( MIX THE CHUNK ORDER )', async () => {
    const tText = TestHelper.generateRandomString(119 * 5);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tChunkNumber).toBeGreaterThan(1);

    // NOW WE HAVE MULTIPLE CHUNKS SO LETS FEED THEM TO THE DECODE ONE BY ONE
    for (let c = 0; c < tChunkNumber; c++) {
      const tChunk = await mSrvEncode.getChunkData(c);
      expect(tChunk.data.length).toBeGreaterThan(0);

      const tDecResp = await mSrvDecode.addQRCodeDecodeData(tChunk.data);
      if (c === 0) {
        expect(tDecResp.first).toBeDefined();
        expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.CHUNKS_MISSING);
      } else {
        expect(tDecResp.chunk).toEqual(c);
      }
    }

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    // NOW DO THE DELETION OF THE CHUNKS
    mSrvDecode.mCipherforgeDecodeData!.chunks[2]!.index = 4;
    mSrvDecode.mCipherforgeDecodeData!.chunks[3]!.index = 5;

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.error).toEqual(CipherforgeDecodedError.FAILED_TO_MERGE_DATA);
  });
});
