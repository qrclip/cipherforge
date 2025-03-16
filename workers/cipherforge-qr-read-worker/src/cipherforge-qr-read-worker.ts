/* istanbul ignore file: see note  */
/// <reference lib="webworker" />
// noinspection JSFileReferences

/*
This is like this to easily test the core functionality without web workers involved,
this part is actually tested on the main app
*/

import { CFQRReadWorkerCommand, CFQRReadWorkerResponse } from './cipherforge-qr-read-lib.types';
import { CipherforgeQRReadWorkerCore } from './cipherforge-qr-read-worker-core';

const gCFLibWorkerCore: CipherforgeQRReadWorkerCore = new CipherforgeQRReadWorkerCore();

//////////////////////////////////////////////////////
// EVENT LISTENER
addEventListener('message', (tCommand: MessageEvent<CFQRReadWorkerCommand>) => {
  gCFLibWorkerCore.HandleMessage(tCommand.data as CFQRReadWorkerCommand).then();
});

//////////////////////////////////////////////////////
// POST THE RESPONSE - DECRYPT
gCFLibWorkerCore.mResponse.subscribe((tResp: CFQRReadWorkerResponse) => {
  if (tResp.dataArray) {
    postMessage(tResp, [tResp.dataArray.buffer]);
    return;
  }
  postMessage(tResp);
});
