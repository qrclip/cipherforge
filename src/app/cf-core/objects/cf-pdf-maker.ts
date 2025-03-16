/* istanbul ignore file: always manual tested */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface CFPdfMakeExportOptions {
  name: string;
  pageWidth: number;
  pageHeight: number;
  QRCodeSize: number;
  minMargin: number;
  unit: 'cm' | 'inches';
}

interface CFPdfMakeQRCode {
  index: number;
  dataUrl: string;
}

export class CFPdfMaker {
  mQRCode: CFPdfMakeQRCode[] = [];
  mPDFDoc: PDFDocument | null = null;
  mPDFFont: PDFFont | null = null;
  mPage: PDFPage | null = null;

  mOptions: CFPdfMakeExportOptions | null = null;

  mColumnsPerPage = 0;
  mRowsPerPage = 0;
  mPagesNeeded = 0;
  mQRCodeMarginRow = 0;
  mQRCodeMarginColumn = 0;
  mCurrentPageNumber = 0;

  ///////////////////////////////////////////////////////////////////
  // ADD QRCODE
  public addQRCode(tIndex: number, tDataUrl: string): void {
    this.mQRCode.push({
      index: tIndex,
      dataUrl: tDataUrl,
    });
  }

  ///////////////////////////////////////////////////////////////////
  // DOWNLOAD FILE
  public async downloadFile(tOptions: CFPdfMakeExportOptions): Promise<void> {
    this.mOptions = tOptions;

    await this.initDocument();

    await this.addPage();

    if (!this.mOptions || !this.mPDFDoc || !this.mPage || !this.mPDFFont) {
      return;
    }

    let tQRCodeFontSize = this.mQRCodeMarginColumn / 3;
    if (tQRCodeFontSize > 16) {
      tQRCodeFontSize = 16;
    }

    let tQRCodeIndex = 0;
    for (let p = 0; p < this.mPagesNeeded; p++) {
      for (let r = 0; r < this.mRowsPerPage; r++) {
        for (let c = 0; c < this.mColumnsPerPage; c++) {
          if (tQRCodeIndex < this.mQRCode.length) {
            // DRAW IMAGE
            const tImage = await this.mPDFDoc.embedPng(this.mQRCode[tQRCodeIndex].dataUrl);
            this.mPage.drawImage(tImage, {
              x: this.mQRCodeMarginRow + c * (this.mOptions.QRCodeSize + this.mQRCodeMarginRow),
              y:
                this.mOptions.pageHeight -
                (this.mQRCodeMarginColumn + r * (this.mOptions.QRCodeSize + this.mQRCodeMarginColumn)) -
                this.mOptions.QRCodeSize,
              width: this.mOptions.QRCodeSize,
              height: this.mOptions.QRCodeSize,
            });

            const tIndexCharacters = this.mQRCode.length.toString().length;
            const tHumanIndex = tQRCodeIndex + 1;
            this.mPage.drawText(tHumanIndex.toString().padStart(tIndexCharacters, '0'), {
              x:
                this.mQRCodeMarginRow +
                c * (this.mOptions.QRCodeSize + this.mQRCodeMarginRow) +
                this.mOptions.QRCodeSize / 2 -
                (tIndexCharacters * tQRCodeFontSize) / 2,
              y:
                this.mOptions.pageHeight -
                (this.mQRCodeMarginColumn + r * (this.mOptions.QRCodeSize + this.mQRCodeMarginColumn)) -
                this.mOptions.QRCodeSize -
                tQRCodeFontSize,
              maxWidth: this.mOptions.QRCodeSize,
              size: tQRCodeFontSize,
              font: this.mPDFFont,
              color: rgb(0.3, 0.3, 0.3),
            });
          }
          tQRCodeIndex++;
        }
      }
      if (tQRCodeIndex < this.mQRCode.length) {
        await this.addPage();
      }
    }

    const tBlob = new Blob([await this.mPDFDoc.save()], { type: 'application/pdf' });

    let tFilename = tOptions.name;
    if (!tFilename.toLowerCase().endsWith('.pdf')) {
      tFilename += '.pdf';
    }
    await this.SaveFile(tFilename, tBlob);
  }

  ///////////////////////////////////////////////////////////////////
  // INIT DOCUMENT
  private async initDocument(): Promise<void> {
    // CREATE PDF
    this.mPDFDoc = await PDFDocument.create();

    this.mPDFFont = await this.mPDFDoc.embedFont(StandardFonts.Helvetica);

    if (!this.mOptions) {
      return;
    }

    this.mColumnsPerPage = Math.floor(this.mOptions.pageWidth / (this.mOptions.QRCodeSize + this.mOptions.minMargin));
    this.mRowsPerPage = Math.floor(this.mOptions.pageHeight / (this.mOptions.QRCodeSize + this.mOptions.minMargin));
    this.mPagesNeeded = Math.ceil(this.mQRCode.length / (this.mColumnsPerPage * this.mRowsPerPage));
    this.mQRCodeMarginRow =
      (this.mOptions.pageWidth - this.mOptions.QRCodeSize * this.mColumnsPerPage) / (this.mColumnsPerPage + 1);
    this.mQRCodeMarginColumn =
      (this.mOptions.pageHeight - this.mOptions.QRCodeSize * this.mRowsPerPage) / (this.mRowsPerPage + 1);
  }

  ///////////////////////////////////////////////////////////////////
  // ADD PAGE
  private async addPage(): Promise<void> {
    this.mCurrentPageNumber += 1;

    if (!this.mPDFDoc || !this.mOptions || !this.mPDFFont) {
      return;
    }

    this.mPage = this.mPDFDoc.addPage([this.mOptions.pageWidth, this.mOptions.pageHeight]);

    let tFontSize = this.mQRCodeMarginColumn / 3;
    if (tFontSize > 12) {
      tFontSize = 12;
    }
    const tPageLabel =
      this.mOptions.name +
      ' | ' +
      this.mCurrentPageNumber.toString().padStart(this.mPagesNeeded.toString().length, '0') +
      ' of ' +
      this.mPagesNeeded.toString();
    this.mPage.drawText(tPageLabel, {
      x: this.mQRCodeMarginColumn / 2 + tFontSize,
      y: this.mOptions.pageHeight - this.mQRCodeMarginColumn / 2 - tFontSize,
      maxWidth: this.mOptions.pageWidth,
      size: tFontSize,
      font: this.mPDFFont,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  /////////////////////////////////////////////////////////////////
  // SAVE FILE TO CACHE WEB
  private async SaveFile(tFileName: string, tBlob: Blob): Promise<boolean> {
    try {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(tBlob);
      link.download = tFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      return false;
    }
  }
}
