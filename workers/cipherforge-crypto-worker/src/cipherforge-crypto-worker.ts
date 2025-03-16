/* istanbul ignore file: see note  */
/// <reference lib="webworker" />
// noinspection JSFileReferences

import { CFCryptoWorkerCommand, CFCryptoWorkerResponse } from './cipherforge-crypto-lib.types';
import { CipherforgeCryptoWorkerCore } from './cipherforge-crypto-worker-core';

/*
This is like this to easily test the core functionality without web workers involved,
this part is actually tested on the main app
*/

const gCFLibWorkerCore: CipherforgeCryptoWorkerCore = new CipherforgeCryptoWorkerCore();

//////////////////////////////////////////////////////
// EVENT LISTENER
addEventListener('message', (tCommand: MessageEvent<CFCryptoWorkerCommand>) => {
  gCFLibWorkerCore.HandleMessage(tCommand.data as CFCryptoWorkerCommand).then();
});

//////////////////////////////////////////////////////
// POST THE RESPONSE - DECRYPT
gCFLibWorkerCore.mResponse.subscribe((tResp: CFCryptoWorkerResponse) => {
  if (tResp.dataArray) {
    postMessage(tResp, [tResp.dataArray.buffer]);
    return;
  }
  postMessage(tResp);
});
