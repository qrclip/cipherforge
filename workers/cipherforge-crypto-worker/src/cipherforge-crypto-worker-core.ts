import { Subject } from 'rxjs';
import {
  CFCryptoWorkerCMDDecryptBuffer,
  CFCryptoWorkerCMDEncryptBuffer,
  CFCryptoWorkerCMDKeyFromPass,
  CFCryptoWorkerCMDKeyFromPassAndKey,
  CFCryptoWorkerCommand,
  CFCryptoWorkerCommandType,
  CFCryptoWorkerResponse,
  CipherforgeKey,
} from './cipherforge-crypto-lib.types';
import * as Sodium from 'libsodium-wrappers';

export class CipherforgeCryptoWorkerCore {
  public mResponse = new Subject<CFCryptoWorkerResponse>();

  /////////////////////////////////////////////////
  // HANDLE MESSAGE
  public async HandleMessage(tCommand: CFCryptoWorkerCommand): Promise<void> {
    switch (tCommand.cmd) {
      case CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY:
        await this.generateRandomKey();
        break;
      case CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY:
        await this.generateKeyFromPasswordAndKey(tCommand.keyFromPassAndKey);
        break;
      case CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD:
        await this.generateKeyFromPassword(tCommand.keyFromPass);
        break;
      case CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT:
        await this.generateRandomPasswordSalt();
        break;
      case CFCryptoWorkerCommandType.ENCRYPT_BUFFER:
        await this.encryptBuffer(tCommand.encryptBuffer);
        break;
      case CFCryptoWorkerCommandType.DECRYPT_BUFFER:
        await this.decryptBuffer(tCommand.decryptBuffer);
        break;
    }
  }

  /////////////////////////////////////////////////
  // SEND ERROR BAD COMMAND
  private sendErrorBadCommand(): void {
    this.mResponse.next({
      cmd: CFCryptoWorkerCommandType.ERROR_BAD_COMMAND,
    });
  }

  /////////////////////////////////////////////////
  // GENERATE RANDOM KEY
  private async generateRandomKey(): Promise<void> {
    await Sodium.ready;

    const tCipherforgeKey: CipherforgeKey = {
      array: Sodium.crypto_aead_xchacha20poly1305_ietf_keygen(),
    };
    /* istanbul ignore else */
    if (tCipherforgeKey.array) {
      tCipherforgeKey.hex = Sodium.to_hex(tCipherforgeKey.array);
    }
    this.mResponse.next({
      cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY,
      key: tCipherforgeKey,
    });
  }

  /////////////////////////////////////////////////
  // JOIN ARRAY
  private joinArray(tA: Uint8Array, tB: Uint8Array): Uint8Array {
    const tFinalArray = new Uint8Array(tA.length + tB.length);
    tFinalArray.set(tA);
    tFinalArray.set(tB, tA.length);
    return tFinalArray;
  }

  /////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD AND KEY
  private async generateKeyFromPasswordAndKey(
    tCFWorkerCMDKeyFromPassAndKey: CFCryptoWorkerCMDKeyFromPassAndKey | undefined
  ): Promise<void> {
    /* istanbul ignore next */
    if (!tCFWorkerCMDKeyFromPassAndKey) {
      this.sendErrorBadCommand();
      return;
    }

    if (
      !tCFWorkerCMDKeyFromPassAndKey.passwordOptions.password ||
      !tCFWorkerCMDKeyFromPassAndKey.passwordOptions.salt ||
      !tCFWorkerCMDKeyFromPassAndKey.passwordOptions.level
    ) {
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
        key: { error: true },
      });
      return;
    }

    try {
      await Sodium.ready;

      const tData = this.joinArray(
        tCFWorkerCMDKeyFromPassAndKey.key,
        Sodium.from_string(tCFWorkerCMDKeyFromPassAndKey.passwordOptions.password)
      );

      const tKey = Sodium.crypto_pwhash(
        Sodium.crypto_aead_xchacha20poly1305_IETF_KEYBYTES,
        tData,
        tCFWorkerCMDKeyFromPassAndKey.passwordOptions.salt,
        tCFWorkerCMDKeyFromPassAndKey.passwordOptions.level.ops,
        16000000 * tCFWorkerCMDKeyFromPassAndKey.passwordOptions.level.mem,
        Sodium.crypto_pwhash_ALG_ARGON2ID13
      );
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
        key: { array: tKey, hex: Sodium.to_hex(tKey) },
      });
    } catch (e) {
      /* istanbul ignore next */
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
        key: { error: true },
      });
    }
  }

  /////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD
  async generateKeyFromPassword(tCFWorkerCMDKeyFromPass: CFCryptoWorkerCMDKeyFromPass | undefined): Promise<void> {
    if (!tCFWorkerCMDKeyFromPass) {
      this.sendErrorBadCommand();
      return;
    }

    /* istanbul ignore if */
    if (
      !tCFWorkerCMDKeyFromPass.passwordOptions.password ||
      !tCFWorkerCMDKeyFromPass.passwordOptions.level ||
      !tCFWorkerCMDKeyFromPass.passwordOptions.salt
    ) {
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
        key: { error: true },
      });
      return;
    }
    try {
      await Sodium.ready;

      const tKey = Sodium.crypto_pwhash(
        Sodium.crypto_aead_xchacha20poly1305_IETF_KEYBYTES,
        Sodium.from_string(tCFWorkerCMDKeyFromPass.passwordOptions.password),
        tCFWorkerCMDKeyFromPass.passwordOptions.salt,
        tCFWorkerCMDKeyFromPass.passwordOptions.level.ops,
        16000000 * tCFWorkerCMDKeyFromPass.passwordOptions.level.mem,
        Sodium.crypto_pwhash_ALG_ARGON2ID13
      );
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
        key: { array: tKey, hex: Sodium.to_hex(tKey) },
      });
    } catch (e) {
      /* istanbul ignore next */
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
        key: { error: true },
      });
    }
  }

  //////////////////////////////////////////////////////
  // GENERATE RANDOM PASSWORD SALT
  private async generateRandomPasswordSalt(): Promise<void> {
    await Sodium.ready;

    const tSalt = Sodium.randombytes_buf(16);
    this.mResponse.next({
      cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT,
      salt: tSalt,
    });
  }

  //////////////////////////////////////////////////////
  // ENCRYPT BUFFER
  private async encryptBuffer(tCFWorkerCMDEncryptBuffer: CFCryptoWorkerCMDEncryptBuffer | undefined): Promise<void> {
    /* istanbul ignore next */
    if (!tCFWorkerCMDEncryptBuffer) {
      this.sendErrorBadCommand();
      return;
    }

    try {
      await Sodium.ready;

      const tIV = Sodium.randombytes_buf(Sodium.crypto_aead_xchacha20poly1305_IETF_NPUBBYTES);

      const tEncryptedData = Sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        tCFWorkerCMDEncryptBuffer.data,
        null,
        null,
        tIV,
        tCFWorkerCMDEncryptBuffer.key,
        'uint8array'
      );

      const tFinalArray = new Uint8Array(tIV.length + tEncryptedData.length);
      tFinalArray.set(tIV);
      tFinalArray.set(tEncryptedData, tIV.length);

      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.ENCRYPT_BUFFER,
        dataArray: tFinalArray,
      });
    } catch (e) {
      /* istanbul ignore next */
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.ENCRYPT_BUFFER,
        error: true,
      });
    }
  }

  //////////////////////////////////////////////////////
  // DECRYPT BUFFER
  private async decryptBuffer(tCFWorkerCMDDecryptBuffer: CFCryptoWorkerCMDDecryptBuffer | undefined): Promise<void> {
    /* istanbul ignore next */
    if (!tCFWorkerCMDDecryptBuffer) {
      this.sendErrorBadCommand();
      return;
    }

    try {
      await Sodium.ready;

      const tIV = tCFWorkerCMDDecryptBuffer.data.slice(0, Sodium.crypto_aead_xchacha20poly1305_IETF_NPUBBYTES);
      const tEncryptedData = tCFWorkerCMDDecryptBuffer.data.slice(Sodium.crypto_aead_xchacha20poly1305_IETF_NPUBBYTES);

      const tData = Sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        tEncryptedData,
        null,
        tIV,
        tCFWorkerCMDDecryptBuffer.key,
        'uint8array'
      );
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.DECRYPT_BUFFER,
        dataArray: tData,
      });
    } catch (e) {
      this.mResponse.next({
        cmd: CFCryptoWorkerCommandType.DECRYPT_BUFFER,
        error: true,
      });
    }
  }
}
