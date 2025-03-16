/* eslint-disable */

import { CFKeyHelper } from './cf-key.helper';
import { CFCrypto } from './cf-crypto';
import { CipherforgeKey } from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

describe('CFKeyHelper', () => {
  ///////////////////////////////////////////////////////////////
  // CHECK KEY
  it('Check Key', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateRandomKey();

    const tOnlyArray: CipherforgeKey = {
      array: new Uint8Array(tKey.array!),
    };

    const tFixedKey1 = CFKeyHelper.checkKey(tOnlyArray);
    expect(tFixedKey1.array).toEqual(tKey.array);
    expect(tFixedKey1.hex).toEqual(tKey.hex);

    const tOnlyHex: CipherforgeKey = {
      hex: tKey.hex,
    };
    const tFixedKey2 = CFKeyHelper.checkKey(tOnlyHex);
    expect(tFixedKey2.hex).toEqual(tKey.hex);
    expect(tFixedKey2.array).toEqual(tKey.array);

    const tFixedKeyEmpty = CFKeyHelper.checkKey({});
    expect(tFixedKeyEmpty).toEqual({});
  });
});
