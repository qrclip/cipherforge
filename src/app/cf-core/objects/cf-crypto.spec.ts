/* eslint-disable */

import { CFCrypto } from './cf-crypto';

describe('CFCrypto', () => {
  ///////////////////////////////////////////////////////////////
  // CREATE RANDOM KEY
  it('Create Random Key', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateRandomKey();
    expect(tKey.array).toBeDefined();
    expect(tKey.array!.length).toEqual(32);
  });

  ///////////////////////////////////////////////////////////////
  // GENERATE RANDOM PASSWORD SALT
  it('Generate Random Password Salt', async () => {
    const tCFCrypto = new CFCrypto();
    const tSalt = await tCFCrypto.generateRandomPasswordSalt();
    expect(tSalt).toBeDefined();
    expect(tSalt!.length).toEqual(16);
  });

  ///////////////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD AND KEY
  it('Generate Key From Password and Key', async () => {
    const tCFCrypto = new CFCrypto();
    const tRandomKey = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32,
    ]);
    const tKey = await tCFCrypto.generateKeyFromPasswordAndKey(tRandomKey, {
      level: {
        ops: 1,
        mem: 1,
      },
      password: 'MyStrongPassword',
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    });
    expect(tKey.array?.length).toEqual(32);
    expect(tKey.hex).toEqual('8ca2550f35770436b4cb61653ef348df42208b2955a77e91ff99ff94fc03e420');
  });

  ///////////////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD AND KEY ( FAIL )
  it('Generate Key From Password and Key ( FAIL )', async () => {
    const tCFCrypto = new CFCrypto();
    const tRandomKey = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32,
    ]);
    const tKey = await tCFCrypto.generateKeyFromPasswordAndKey(tRandomKey, {
      level: {
        ops: 1,
        mem: 1,
      },
      password: 'MyStrongPassword',
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), // WRONG SALT SIZE
    });
    expect(tKey.error).toEqual(true);
  });

  ///////////////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD
  it('Generate Key From Password', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateKeyFromPassword({
      level: {
        ops: 1,
        mem: 1,
      },
      password: 'MyStrongPassword',
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    });
    expect(tKey.array?.length).toEqual(32);
    expect(tKey.hex).toEqual('484b4c5a9fba04c8fbc086819505a755da6b894b9a36de840a1e57104a28abe3');
  });

  ///////////////////////////////////////////////////////////////
  // GENERATE KEY FROM PASSWORD ( FAIL )
  it('Generate Key From Password ( FAIL )', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateKeyFromPassword({
      level: {
        ops: 1,
        mem: 1,
      },
      password: '', // NO PASSWORD
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    });
    expect(tKey.error).toEqual(true);
  });

  ///////////////////////////////////////////////////////////////
  // TERMINATE
  it('Terminate', async () => {
    const tCFCrypto = new CFCrypto();

    // @ts-ignore
    spyOn(tCFCrypto.mCFWorker, 'terminate').and.callFake(() => {});

    tCFCrypto.terminate();

    // @ts-ignore
    expect(tCFCrypto.mCFWorker.terminate).toHaveBeenCalled();
  });

  ///////////////////////////////////////////////////////////////
  // ENCRYPT AND DECRYPT BUFFER
  it('Encrypt and Decrypt', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateRandomKey();
    expect(tKey.array).toBeDefined();
    expect(tKey.array!.length).toEqual(32);

    const tPlainData = new Uint8Array([100, 102, 103, 104, 107]);
    const tEncryptedData = await tCFCrypto.encryptBuffer(tPlainData, tKey.array!);
    expect(tPlainData.length).toEqual(0); // ITS TRANSFERRED SO ITS EMPTY USING THE WORKER
    expect(tEncryptedData).toBeDefined();
    expect(tEncryptedData!.length).toEqual(45);

    const tDecryptedData = await tCFCrypto.decryptBuffer(tEncryptedData!, tKey.array!);
    expect(tEncryptedData!.length).toEqual(0); // ITS TRANSFERRED SO ITS EMPTY USING THE WORKER
    expect(tDecryptedData).toBeDefined();
    expect(tDecryptedData![0]).toEqual(100);
    expect(tDecryptedData![1]).toEqual(102);
    expect(tDecryptedData![2]).toEqual(103);
    expect(tDecryptedData![3]).toEqual(104);
    expect(tDecryptedData![4]).toEqual(107);
  });

  ///////////////////////////////////////////////////////////////
  // ENCRYPT AND DECRYPT BUFFER ( FAIL )
  it('Encrypt and Decrypt ( FAIL )', async () => {
    const tCFCrypto = new CFCrypto();
    const tKey = await tCFCrypto.generateRandomKey();
    expect(tKey.array).toBeDefined();
    expect(tKey.array!.length).toEqual(32);

    const tWrongKey = new Uint8Array([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32,
    ]);

    const tPlainData = new Uint8Array([98, 102, 103, 104, 107]);

    //new Uint8Array(tPlainData) is for cloning since the array is transferred
    let tEncryptedData = await tCFCrypto.encryptBuffer(new Uint8Array(tPlainData), new Uint8Array([0, 1]));
    expect(tEncryptedData).toEqual(null);

    tEncryptedData = await tCFCrypto.encryptBuffer(new Uint8Array(tPlainData), tKey.array!);
    expect(tEncryptedData).toBeDefined();
    expect(tEncryptedData!.length).toEqual(45);

    let tDecryptedData = await tCFCrypto.decryptBuffer(new Uint8Array(tEncryptedData!), tWrongKey);
    expect(tDecryptedData).toEqual(null);

    tDecryptedData = await tCFCrypto.decryptBuffer(new Uint8Array(tEncryptedData!), tKey.array!);
    expect(tDecryptedData).toBeDefined();
    expect(tDecryptedData![0]).toEqual(98);
    expect(tDecryptedData![1]).toEqual(102);
    expect(tDecryptedData![2]).toEqual(103);
    expect(tDecryptedData![3]).toEqual(104);
    expect(tDecryptedData![4]).toEqual(107);
  });
});
