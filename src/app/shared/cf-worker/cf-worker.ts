import { CF_WEBWORKER_CRYPTO_NAME } from '../../cf-core/cf-constants';
import {
  CFCryptoWorkerCommand,
  CFCryptoWorkerResponse,
} from '../../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

export class CFWorker {
  private mWorker: Worker | null = null;

  /////////////////////////////////////////////////////////////////////////
  // TERMINATE
  public terminate(): void {
    if (this.mWorker) {
      this.mWorker.terminate();
    }
  }

  /////////////////////////////////////////////////////////////////////////
  // CALL WORKER
  public async call(tCmd: CFCryptoWorkerCommand): Promise<CFCryptoWorkerResponse> {
    if (!this.mWorker) {
      this.mWorker = new Worker('assets/workers/' + CF_WEBWORKER_CRYPTO_NAME);
    }

    return new Promise((resolve, reject) => {
      /* istanbul ignore if */
      if (!this.mWorker) {
        reject(new Error('Worker not available.'));
        return;
      }

      // Message handler
      const messageHandler = ({ data }: MessageEvent) => {
        if (data && this.mWorker) {
          this.mWorker.removeEventListener('message', messageHandler);
          this.mWorker.removeEventListener('error', errorHandler);
          resolve(data);
          return;
        }
        /* istanbul ignore next */
        reject(new Error('No data received from worker.'));
      };

      // Error handler
      /* istanbul ignore next */
      const errorHandler = (error: ErrorEvent) => {
        if (this.mWorker) {
          this.mWorker.removeEventListener('message', messageHandler);
          this.mWorker.removeEventListener('error', errorHandler);
        }
        reject(error);
      };

      this.mWorker.addEventListener('message', messageHandler);
      this.mWorker.addEventListener('error', errorHandler);

      // TRANSFERRING DATA
      /* istanbul ignore next */
      if (tCmd.dataArray) {
        this.mWorker.postMessage(tCmd, [tCmd.dataArray.buffer]);
        return;
      }

      if (tCmd.encryptBuffer) {
        this.mWorker.postMessage(tCmd, [tCmd.encryptBuffer.data.buffer]);
        return;
      }

      if (tCmd.decryptBuffer) {
        this.mWorker.postMessage(tCmd, [tCmd.decryptBuffer.data.buffer]);
        return;
      }

      this.mWorker.postMessage(tCmd);
    });
  }
}
