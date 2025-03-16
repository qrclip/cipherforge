import { CipherforgeOptionsPassword } from '../cipherforge.types';
import { CFWorker } from '../../shared/cf-worker/cf-worker';
import {
  CFCryptoWorkerCommandType,
  CipherforgeKey,
} from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

export const CF_CRYPTO_KEY_BYTES = 32;

export class CFCrypto {
  private readonly mCFWorker: CFWorker = new CFWorker();

  /////////////////////////////////////////////////////////////////////////
  // DESTRUCTOR
  terminate(): void {
    this.mCFWorker.terminate();
  }

  //////////////////////////////////////////////////////
  // GENERATE RANDOM KEY
  public async generateRandomKey(): Promise<CipherforgeKey> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY,
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY) {
      if (tResp.key) {
        return tResp.key;
      }
    }

    /* istanbul ignore next: no way to force this to happen */
    return { error: true };
  }

  //////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD AND KEY
  public async generateKeyFromPasswordAndKey(
    tRandomKey: Uint8Array,
    tCipherforgeOptionsPassword: CipherforgeOptionsPassword
  ): Promise<CipherforgeKey> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
      keyFromPassAndKey: {
        passwordOptions: tCipherforgeOptionsPassword,
        key: tRandomKey,
      },
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY) {
      if (tResp.key && tResp.key.array) {
        return tResp.key;
      }
    }
    return { error: true };
  }

  //////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD AND KEY
  public async generateKeyFromPassword(
    tCipherforgeOptionsPassword: CipherforgeOptionsPassword
  ): Promise<CipherforgeKey> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
      keyFromPass: {
        passwordOptions: tCipherforgeOptionsPassword,
      },
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD) {
      if (tResp.key && tResp.key.array) {
        return tResp.key;
      }
    }
    return { error: true };
  }

  //////////////////////////////////////////////////////
  // GENERATE RANDOM PASSWORD SALT
  public async generateRandomPasswordSalt(): Promise<Uint8Array> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT,
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT) {
      if (tResp.salt) {
        return tResp.salt;
      }
    }
    /* istanbul ignore next: no way to force this to happen */
    return new Uint8Array(0);
  }

  //////////////////////////////////////////////////////
  // ENCRYPT BUFFER
  public async encryptBuffer(tData: Uint8Array, tKey: Uint8Array): Promise<Uint8Array | null> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.ENCRYPT_BUFFER,
      encryptBuffer: {
        key: tKey,
        data: tData,
      },
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.ENCRYPT_BUFFER) {
      if (tResp.dataArray) {
        return tResp.dataArray;
      }
    }
    return null;
  }

  //////////////////////////////////////////////////////
  // DECRYPT BUFFER
  public async decryptBuffer(tData: Uint8Array, tKey: Uint8Array): Promise<Uint8Array | null> {
    const tResp = await this.mCFWorker.call({
      cmd: CFCryptoWorkerCommandType.DECRYPT_BUFFER,
      decryptBuffer: {
        key: tKey,
        data: tData,
      },
    });

    if (tResp.cmd === CFCryptoWorkerCommandType.DECRYPT_BUFFER) {
      if (tResp.dataArray) {
        return tResp.dataArray;
      }
    }
    return null;
  }
}
