import { Component, Input } from '@angular/core';
import { CipherforgeDecoded } from '../../cf-core/cipherforge.types';

@Component({
  selector: 'app-cf-display-data',
  templateUrl: './cf-display-data.component.html',
  styleUrls: ['./cf-display-data.component.scss'],
})
export class CFDisplayDataComponent {
  @Input() mCipherforgeDecoded: CipherforgeDecoded | null = null;

  /* istanbul ignore next */
  /////////////////////////////////////////////////////////////
  // DOWNLOAD FILE
  async onDownloadFile(tIndex: number): Promise<void> {
    if (!this.mCipherforgeDecoded || !this.mCipherforgeDecoded.files) {
      return;
    }
    if (tIndex >= 0 && tIndex < this.mCipherforgeDecoded.files.length) {
      await this.downloadFile(this.mCipherforgeDecoded.files[tIndex].name, this.mCipherforgeDecoded.files[tIndex].data);
    }
  }

  /* istanbul ignore next */
  /////////////////////////////////////////////////////////////
  // ON DOWNLOAD ALL
  async onDownloadAll(): Promise<void> {
    if (!this.mCipherforgeDecoded || !this.mCipherforgeDecoded.files) {
      return;
    }
    for (const tFile of this.mCipherforgeDecoded.files) {
      await this.downloadFile(tFile.name, tFile.data);
    }
  }

  /* istanbul ignore next */
  /////////////////////////////////////////////////////////////
  // DOWNLOAD FILE
  private async downloadFile(fileName: string, byteArray: Uint8Array) {
    // Step 1: Create a Blob from the byte array
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    // Step 2: Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Step 3: Create a download link
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;

    // Append the anchor to the body
    document.body.appendChild(a);

    // Step 4: Trigger the download
    a.click();

    // Step 5: Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
