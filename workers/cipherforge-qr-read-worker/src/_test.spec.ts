import { CipherforgeQRReadWorkerCore } from './cipherforge-qr-read-worker-core';
import { CFQRReadWorkerCMDReadType, CFQRReadWorkerCommandType } from './cipherforge-qr-read-lib.types';

const gQRCodeBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAXNSR0IArs4c6QAABKJJREFUeF7tndFy6yAMBev//+h0pm8mneycSpBC9r4KsDirI2Mn6b0ej8fjy3/HKHAJ9BiWPxsR6Fk8BXoYT4EK9DQFDtuP91CBHqbAYdvRoQI9TIHDtqNDBXqYAodtR4cK9DAFDtuODhXoYQoctp2yQ6/rWirJ+PEtXZ8+7h3np+t3b57ypesJdChIgepQMk0U16FQUCSQLXeoNxIkKs9fBqfrd49P10v3271++z2UHDF7w6lANJ7i6X7G8d3rCzQ8FL27YKmABCrQe41Qy6DnxLHi6LHhv8fJQWn+tN5TC69+L1eg2YsVgRZbYlpwqeCzO5AOHX7ZIdCwJFLBaPmqQ+gUSvmmjxU6FIgKtPbbsemPLbMruNtxOjQ8tNhy7w5MC5L0O86htGG6x+rQf+ZQgaYlG37asvoeKlCBvqwBusfNLlgq0OWv/tKE0ntYdX2aT0BpPsW7159+KKINUbx7w3S91QXVvT+BAuFuwWcXjEAFelcgPRSkLW8c3/1qkBz47v2lerU7NE0gHS/Q14oJtPnFSFqg1IHS9QQq0LRm1o6ne17xPcrazfzhamWH/uGaU6cI9LCSFahAp3aM1YuXWy45gjZE9ZQ+J6aPNdU3N+n+q/mRngIdFKICogIgwQUaPlZUBRNo8Qe/ttz7N+9JD+oA7S03TYjuQVXHoQDQAajF0n7J8RSn/J/ym/3bFkpIoDr0ViPkkLSgaL3UUTSe4pS/Dm0+1VYLYDug1FLp0waaT4JShdP6NJ/yp/kCHRQS6F2Q6afc1AF0qq06gk6t5CiKpwWmQ3Xoy5oqO7Ra8d0VnVY8dZA0P3Jwmh+t137KFWgmuUDDx4xUMB0KBUkCVQ81BIziaUf5uJbbDbC6Xvd8AkoFRPGsYfPo8qGoKmDqGHJ4NZ8UAI2nOCPKRgg0/DM4VID0HE2Oz/A9jxaoQKs11DufWhrFZzsuvX5VnbJDqwlU55NgFBdolUDzfAJGcYE2A6kuR8AoLlB4c1MFRPOnnxLD/5SACoYeo7r3U76HUsIEKI13C0AOTZ976bGF1kv1eMq/+0ti1YRovkBfK6RDw1sIOZDi2zm020F0jyJHpy2V1qP9pfmm4ym/dofShikhAlBdv3rPp+ungNLxpJ9ASaEhLtBQMB364X/RmuqFWuy7HbddyyVB6dRX3TBdX6BwzE+P7QLd7MdK5BCBCvRWA1Qw1FKrh7D0lpCOpzPC9Fd/q1uuQO9Ipz+HkuDVlkvr69DQ49RCSHCB1p47j2+55Mi0ANP1yA+0Hs2n+HEtlwQTKJREKhBVGB2q0nh6iqX90Hrp/mh8Gtehzd/LJQDUQWg+xacDpQQoTo5J43S9tAPQoY8AUv6U7/JDUZoQtbRuwd99yhZo2CLJQQIdFOiuMB1aey5tv4dWWyzNT1suFQg5lOZX86H9pnGBDopVDzGzOxYBFqhA7wqkhw6qMIpXWxzl+/EOJQDG1ypQbrlr0/VqpIBASaHN4gLdDBilK1BSaLO4QDcDRukKlBTaLC7QzYBRugIlhTaLC3QzYJSuQEmhzeIC3QwYpStQUmizuEA3A0bpCpQU2iwu0M2AUbrfkT57DrILz7UAAAAASUVORK5CYII=';

const gNoQRCodeImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAALklEQVR4nGL5N+MmAyr4/X4+mggTAxFgMCpibJYvRBMSnJw+sG6iniJAAAAA//9BRQcwWh4w7QAAAABJRU5ErkJggg==';

function dataURLToPixels(dataURL: string): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image();
    img.onload = () => {
      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Unable to get canvas context'));
        return;
      }

      // Set canvas size to the image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Get the pixel data from the canvas
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      resolve(imageData.data); // Uint8ClampedArray of pixel data
    };
    img.onerror = error => {
      reject(error);
    };

    // Load the image
    img.src = dataURL;
  });
}

describe('CipherforgeQRReadWorkerCore', () => {
  let mCipherforgeQRReadWorkerCore: CipherforgeQRReadWorkerCore;

  beforeEach(() => {
    mCipherforgeQRReadWorkerCore = new CipherforgeQRReadWorkerCore();
  });

  ///////////////////////////////////////////////////////////////
  // HANDLE MESSAGE
  it('HandleMessage', async () => {
    // @ts-ignore
    spyOn(mCipherforgeQRReadWorkerCore, 'readQRCode').and.callFake(() => {
      return Promise.resolve();
    });

    await mCipherforgeQRReadWorkerCore.HandleMessage({
      cmd: CFQRReadWorkerCommandType.READ_QR_CODE,
      read: {
        type: CFQRReadWorkerCMDReadType.STRING,
        width: 0,
        height: 0,
        data: new Uint8ClampedArray(0),
      },
    });

    // @ts-ignore
    expect(mCipherforgeQRReadWorkerCore.readQRCode).toHaveBeenCalled();
  });

  ///////////////////////////////////////////////////////////////
  // READ QR CODE UNDEFINED
  it('readQRCode - undefined', done => {
    mCipherforgeQRReadWorkerCore.mResponse.subscribe(tResp => {
      expect(tResp.cmd).toEqual(CFQRReadWorkerCommandType.ERROR_BAD_COMMAND);
      done();
    });
    // @ts-ignore
    mCipherforgeQRReadWorkerCore.readQRCode(undefined);
  });

  ///////////////////////////////////////////////////////////////
  // READ QR CODE UNDEFINED
  it('readQRCode - string', done => {
    dataURLToPixels(gQRCodeBase64).then(tImageData => {
      mCipherforgeQRReadWorkerCore.mResponse.subscribe(tResp => {
        expect(tResp.cmd).toEqual(CFQRReadWorkerCommandType.READ_QR_CODE);
        expect(tResp.dataString).toEqual(' !');
        done();
      });

      // @ts-ignore
      mCipherforgeQRReadWorkerCore.readQRCode({
        type: CFQRReadWorkerCMDReadType.STRING,
        width: 116,
        height: 116,
        data: tImageData,
      });
    });
  });

  ///////////////////////////////////////////////////////////////
  // READ QR CODE UNDEFINED
  it('readQRCode - binary', done => {
    dataURLToPixels(gQRCodeBase64).then(tImageData => {
      mCipherforgeQRReadWorkerCore.mResponse.subscribe(tResp => {
        expect(tResp.cmd).toEqual(CFQRReadWorkerCommandType.READ_QR_CODE);
        expect(tResp.dataArray).toEqual(new Uint8Array([32, 33]));
        done();
      });

      // @ts-ignore
      mCipherforgeQRReadWorkerCore.readQRCode({
        type: CFQRReadWorkerCMDReadType.BINARY,
        width: 116,
        height: 116,
        data: tImageData,
      });
    });
  });

  ///////////////////////////////////////////////////////////////
  // READ QR CODE UNDEFINED
  it('readQRCode - no qr code found', done => {
    dataURLToPixels(gNoQRCodeImage).then(tImageData => {
      mCipherforgeQRReadWorkerCore.mResponse.subscribe(tResp => {
        expect(tResp.cmd).toEqual(CFQRReadWorkerCommandType.READ_QR_CODE);
        expect(tResp.dataArray).toBeUndefined();
        expect(tResp.dataString).toBeUndefined();
        done();
      });

      // @ts-ignore
      mCipherforgeQRReadWorkerCore.readQRCode({
        type: CFQRReadWorkerCMDReadType.STRING,
        width: 12,
        height: 12,
        data: tImageData,
      });
    });
  });
});
