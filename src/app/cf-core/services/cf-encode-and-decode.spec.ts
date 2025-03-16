/* eslint-disable */

import { CFCoreDecodeService } from './cf-core-decode.service';
import { TestBed } from '@angular/core/testing';
import { CFCoreEncodeService } from './cf-core-encode.service';
import { CipherforgeDecodeDataReady, CipherforgeDecodedError, CipherforgeEncodeError } from '../cipherforge.types';
import { TestHelper } from '../../shared/_mocks/test.helper';

describe('CF CORE ENCODE AND DECODE', () => {
  let mSrvDecode: CFCoreDecodeService;
  let mSrvEncode: CFCoreEncodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CFCoreDecodeService, CFCoreEncodeService],
    });
    mSrvDecode = TestBed.inject(CFCoreDecodeService);
    mSrvEncode = TestBed.inject(CFCoreEncodeService);
  });

  ///////////////////////////////////////////////////////////
  // CREATE SERVICES
  it('create services', () => {
    expect(mSrvDecode).toBeTruthy();
    expect(mSrvEncode).toBeTruthy();
  });

  ///////////////////////////////////////////////////////////
  // FULL 001
  it('full(001) process just text, one chunk no encryption', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data', [], {
      version: '40',
      errorCorrection: 'L',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data');
  });

  ///////////////////////////////////////////////////////////
  // FULL 002
  it('full(002) process text and 2 files, one chunk with key', async () => {
    const tEncResp = await mSrvEncode.encode(
      'The secret data with file',
      [
        {
          name: 'file01.bin',
          data: new Uint8Array([100, 101, 102]),
        },
        {
          name: 'file02.bin',
          data: new Uint8Array([200, 201, 202]),
        },
      ],
      {
        version: '40',
        errorCorrection: 'L',
        key: {
          hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
        },
      }
    );
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_KEY);

    await mSrvDecode.setDecodeKey({
      hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
    });

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data with file');
    expect(tData.files?.length).toEqual(2);
    expect(tData.files![0].name).toEqual('file01.bin');
    expect(tData.files![0].data).toEqual(new Uint8Array([100, 101, 102]));
    expect(tData.files![1].name).toEqual('file02.bin');
    expect(tData.files![1].data).toEqual(new Uint8Array([200, 201, 202]));
  });

  ///////////////////////////////////////////////////////////
  // FULL 003
  it('full(003) process just text, only password', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data with pass', [], {
      version: '40',
      errorCorrection: 'L',
      password: {
        level: {
          ops: 1,
          mem: 1,
        },
        password: 'myPass1234',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_PASSWORD);

    await mSrvDecode.setDecodePassword('myPass1234');

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data with pass');
  });

  ///////////////////////////////////////////////////////////
  // FULL 004
  it('full(004) process just text, only password failing pass', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data with pass', [], {
      version: '40',
      errorCorrection: 'L',
      password: {
        level: {
          ops: 1,
          mem: 1,
        },
        password: 'myPass1234',
      },
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_PASSWORD);

    await mSrvDecode.setDecodePassword('wrongPassword');

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    let tData = await mSrvDecode.getDecodedData();
    expect(tData.error).toEqual(CipherforgeDecodedError.FAILED_TO_DECODE_DATA);

    await mSrvDecode.setDecodePassword('myPass1234');

    tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data with pass');
  });

  ///////////////////////////////////////////////////////////
  // FULL 005
  it('full(005) process just text, password and key', async () => {
    const tEncResp = await mSrvEncode.encode('The secret data with pass and key!', [], {
      version: '40',
      errorCorrection: 'L',
      password: {
        level: {
          ops: 1,
          mem: 1,
        },
        password: 'myPass1234',
      },
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

    await mSrvDecode.setDecodeKey({
      hex: '8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420',
    });

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.NO_PASSWORD);

    await mSrvDecode.setDecodePassword('myPass1234');

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual('The secret data with pass and key!');
  });

  ///////////////////////////////////////////////////////////
  // FULL 006
  it('full(006) process just text multiple chunks', async () => {
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

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual(tText);
  });

  ///////////////////////////////////////////////////////////
  // FULL 007
  it('full(007) process just text multiple chunks change qr code settings', async () => {
    const tText = TestHelper.generateRandomString(119 * 3);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tFirstChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tFirstChunkNumber).toBeGreaterThan(1);

    await mSrvEncode.changeEncodeOptions('40', 'L');

    const tOptions = mSrvEncode.getOptions();
    expect(tOptions?.version).toEqual('40');
    expect(tOptions?.errorCorrection).toEqual('L');

    const tSecondChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tSecondChunkNumber).toEqual(1);

    const tFirstChunk = await mSrvEncode.getChunkData(0);
    expect(tFirstChunk.data.length).toBeGreaterThan(0);

    const tDecResp = await mSrvDecode.addQRCodeDecodeData(tFirstChunk.data);
    expect(tDecResp.first).toBeDefined();

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual(tText);
  });

  ///////////////////////////////////////////////////////////
  // FULL 008
  it('full(008) process just text multiple chunks inverse order', async () => {
    const tText = TestHelper.generateRandomString(119 * 3);

    const tEncResp = await mSrvEncode.encode(tText, [], {
      version: '10',
      errorCorrection: 'H',
    });
    expect(tEncResp).toEqual(CipherforgeEncodeError.OK);

    const tChunkNumber = await mSrvEncode.getChunkNumber();
    expect(tChunkNumber).toBeGreaterThan(1);

    // NOW WE HAVE MULTIPLE CHUNKS SO LETS FEED THEM TO THE DECODE ONE BY ONE
    for (let c = tChunkNumber - 1; c >= 0; c--) {
      const tChunk = await mSrvEncode.getChunkData(c);
      expect(tChunk.data.length).toBeGreaterThan(0);

      const tDecResp = await mSrvDecode.addQRCodeDecodeData(tChunk.data);
      if (c === 0) {
        expect(tDecResp.first).toBeDefined();
        expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);
      } else {
        expect(tDecResp.chunk).toEqual(c);
      }
    }

    const tStatus = await mSrvDecode.getStatus();
    expect(tStatus.chunkCount).toEqual(3);
    expect(tStatus.chunks.length).toEqual(3);

    expect(mSrvDecode.checkDecodeDataReady()).toEqual(CipherforgeDecodeDataReady.OK);

    const tData = await mSrvDecode.getDecodedData();
    expect(tData.text).toEqual(tText);
  });
});
