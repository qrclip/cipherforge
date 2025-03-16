import { CipherforgeKey } from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';
import { CFArrayHelper } from '../../shared/helpers/cf-array.helper';
import { CF_CRYPTO_KEY_BYTES } from './cf-crypto';

export class CFKeyHelper {
  /////////////////////////////////////////////////////
  // CHECK KEY
  public static checkKey(tCipherforgeKey: CipherforgeKey): CipherforgeKey {
    try {
      if (tCipherforgeKey.array && !tCipherforgeKey.hex) {
        tCipherforgeKey.hex = CFArrayHelper.arrayToHexString(tCipherforgeKey.array);
      }
      if (tCipherforgeKey.hex && !tCipherforgeKey.array) {
        tCipherforgeKey.array = CFArrayHelper.hexStringToArray(tCipherforgeKey.hex);
      }

      if (
        tCipherforgeKey.array &&
        tCipherforgeKey.hex &&
        tCipherforgeKey.hex === CFArrayHelper.arrayToHexString(tCipherforgeKey.array) &&
        tCipherforgeKey.array.length === CF_CRYPTO_KEY_BYTES
      ) {
        return tCipherforgeKey;
      }
    } catch (e) {
      return {};
    }
    return {};
  }
}
