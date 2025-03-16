import { CFArrayHelper } from './cf-array.helper';

describe('CFArrayHelper', () => {
  ///////////////////////////////////////////////////////////////
  // JOIN ARRAY
  it('joinArray', async () => {
    const tArrayA = new Uint8Array([100, 101]);
    const tArrayB = new Uint8Array([102, 103]);
    const tJoined = CFArrayHelper.joinArray(tArrayA, tArrayB);
    expect(tJoined[0]).toEqual(100);
    expect(tJoined[1]).toEqual(101);
    expect(tJoined[2]).toEqual(102);
    expect(tJoined[3]).toEqual(103);
    expect(tJoined.length).toEqual(4);
  });

  ///////////////////////////////////////////////////////////////
  // HEX
  it('hex transform', async () => {
    const tArray = new Uint8Array([25, 50]);
    const tHex = CFArrayHelper.arrayToHexString(tArray);
    const tArrayFromHex = CFArrayHelper.hexStringToArray(tHex);
    expect(tArray).toEqual(tArrayFromHex);
  });

  ///////////////////////////////////////////////////////////////
  // STRING
  it('string transform', async () => {
    const tArray = CFArrayHelper.stringToArray('Testing one çá!!');
    const tStringFromArray = CFArrayHelper.arrayToString(tArray);
    expect(tStringFromArray).toEqual('Testing one çá!!');
  });

  ///////////////////////////////////////////////////////////////
  // OFFSET 2
  it('offset 2', async () => {
    const tArray = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const tOffsetArray = CFArrayHelper.offsetArray(tArray, 2);
    expect(tOffsetArray).toEqual(new Uint8Array([18, 19, 10, 11, 12, 13, 14, 15, 16, 17]));
    const tOffsetArray2 = CFArrayHelper.offsetArray(tOffsetArray, -2);
    expect(tOffsetArray2).toEqual(new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]));
  });

  ///////////////////////////////////////////////////////////////
  // OFFSET 113
  it('offset 113', async () => {
    const tArray = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const tOffsetArray = CFArrayHelper.offsetArray(tArray, 113);
    expect(tOffsetArray).toEqual(new Uint8Array([17, 18, 19, 10, 11, 12, 13, 14, 15, 16]));
    const tOffsetArray2 = CFArrayHelper.offsetArray(tOffsetArray, -113);
    expect(tOffsetArray2).toEqual(new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]));
  });
});
