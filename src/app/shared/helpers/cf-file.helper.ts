export class CFFileHelper {
  /////////////////////////////////////////////////////////////////
  // READ FILE HAS UINT8 ARRAY
  public static async readFileContentHasUint8Array(tFile: File): Promise<Uint8Array> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = function (fileLoadEvent) {
        /* istanbul ignore else */
        if (fileLoadEvent.target) {
          if (typeof reader.result !== 'string' && reader.result !== null) {
            const typedArray = new Uint8Array(reader.result);
            resolve(typedArray);
          }
        } else {
          resolve(new Uint8Array(0));
        }
      };
      /* istanbul ignore next */
      reader.onerror = function () {
        resolve(new Uint8Array(0));
      };
      reader.readAsArrayBuffer(tFile);
    });
  }

  /////////////////////////////////////////////////////////////////
  // READ FILE AS DATA URL
  public static async readFileAsDataURL(tFile: File): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = function (fileLoadEvent) {
        /* istanbul ignore else */
        if (fileLoadEvent.target) {
          const dataUrl = fileLoadEvent.target.result;
          if (typeof dataUrl === 'string') {
            resolve(dataUrl);
          }
        } else {
          resolve('');
        }
      };
      /* istanbul ignore next */
      reader.onerror = function () {
        resolve('');
      };
      reader.readAsDataURL(tFile);
    });
  }
}
