import { CipherforgeCryptoWorkerCore } from './cipherforge-crypto-worker-core';
import { CFCryptoWorkerCommandType, CipherforgeOptionsPassword } from './cipherforge-crypto-lib.types';

describe('CipherforgeCryptoWorkerCore', () => {
  let mCipherforgeCryptoWorkerCore: CipherforgeCryptoWorkerCore;

  beforeEach(() => {
    mCipherforgeCryptoWorkerCore = new CipherforgeCryptoWorkerCore();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - GENERATE KEY
  it('HandleMessage - Generate Key', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY);
      expect(tResp.key).toBeDefined();
      expect(tResp.key?.array?.length).toEqual(32);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_KEY,
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - RANDOM SALT
  it('HandleMessage - Generate Random Salt', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT);
      expect(tResp.salt).toBeDefined();
      expect(tResp.salt?.length).toEqual(16);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_RANDOM_PASSWORD_SALT,
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - GENERATE KEY FROM PASSWORD AND KEY
  it('HandleMessage - generateKeyFromPasswordAndKey', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY);
      expect(tResp.key?.hex).toEqual('d9f106832e0bfeadd5c011a15513ab6411bb2d16c7da5cb3d807c59cf64e7912');
      expect(tResp.key?.array?.length).toEqual(32);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
        keyFromPassAndKey: {
          passwordOptions: {
            level: {
              ops: 1,
              mem: 1,
            },
            password: 'Password123',
            salt: new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]),
          },
          key: new Uint8Array([100, 102, 104]),
        },
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - GENERATE KEY FROM PASSWORD AND KEY ERROR
  it('HandleMessage - generateKeyFromPasswordAndKey error', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY);
      expect(tResp.key!.error).toEqual(true);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD_AND_KEY,
        keyFromPassAndKey: {
          passwordOptions: {
            level: {
              ops: 1,
              mem: 1,
            },
          },
          key: new Uint8Array([100, 102, 104]),
        },
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - GENERATE KEY FROM PASSWORD
  it('HandleMessage - generateKeyFromPassword', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD);
      expect(tResp.key?.hex).toEqual('6d23cdf6e5f3336ec6507128a1eb0e8a6dc22c6d0280d8b73b5c9a57a10a856b');
      expect(tResp.key?.array?.length).toEqual(32);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
        keyFromPass: {
          passwordOptions: {
            level: {
              ops: 1,
              mem: 1,
            },
            password: 'PasswordABC',
            salt: new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]),
          },
        },
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - GENERATE KEY FROM PASSWORD BAD
  it('HandleMessage - generateKeyFromPassword bad', done => {
    // @ts-ignore
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFCryptoWorkerCommandType.ERROR_BAD_COMMAND);
      done();
    });

    mCipherforgeCryptoWorkerCore
      .HandleMessage({
        cmd: CFCryptoWorkerCommandType.GENERATE_KEY_FROM_PASSWORD,
      })
      .then();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - ENCRYPT DECRYPT
  it('HandleMessage - encrypt decrypt', done => {
    const tKey: Uint8Array = new Uint8Array(32);

    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      if (tResp.cmd === CFCryptoWorkerCommandType.ENCRYPT_BUFFER) {
        mCipherforgeCryptoWorkerCore.HandleMessage({
          cmd: CFCryptoWorkerCommandType.DECRYPT_BUFFER,
          decryptBuffer: {
            data: new Uint8Array(tResp.dataArray!),
            key: new Uint8Array(tKey),
          },
        });
      }
      if (tResp.cmd === CFCryptoWorkerCommandType.DECRYPT_BUFFER) {
        expect(tResp.dataArray).toEqual(new Uint8Array([0, 1]));
        done();
      }
    });

    mCipherforgeCryptoWorkerCore.HandleMessage({
      cmd: CFCryptoWorkerCommandType.ENCRYPT_BUFFER,
      encryptBuffer: {
        data: new Uint8Array([0, 1]),
        key: new Uint8Array(tKey),
      },
    });
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE - ENCRYPT DECRYPT BAD
  it('HandleMessage - encrypt decrypt bad key', done => {
    const tKey: Uint8Array = new Uint8Array(32);
    tKey[0] = 123;
    mCipherforgeCryptoWorkerCore.mResponse.subscribe(tResp => {
      if (tResp.cmd === CFCryptoWorkerCommandType.ENCRYPT_BUFFER) {
        const tBadKey = new Uint8Array(tKey);
        tBadKey[0] = 234;
        mCipherforgeCryptoWorkerCore.HandleMessage({
          cmd: CFCryptoWorkerCommandType.DECRYPT_BUFFER,
          decryptBuffer: {
            data: new Uint8Array(tResp.dataArray!),
            key: tBadKey,
          },
        });
      }
      if (tResp.cmd === CFCryptoWorkerCommandType.DECRYPT_BUFFER) {
        expect(tResp.error).toEqual(true);
        done();
      }
    });

    mCipherforgeCryptoWorkerCore.HandleMessage({
      cmd: CFCryptoWorkerCommandType.ENCRYPT_BUFFER,
      encryptBuffer: {
        data: new Uint8Array([0, 1]),
        key: new Uint8Array(tKey),
      },
    });
  });
});
