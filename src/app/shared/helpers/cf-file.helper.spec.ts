import { CFFileHelper } from './cf-file.helper';

describe('CFFileHelper', () => {
  ///////////////////////////////////////////////////////////////
  // READ FILE AS DATA URL
  it('readFileAsDataURL', async () => {
    const tFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    const tData = await CFFileHelper.readFileAsDataURL(tFile);
    expect(tData).toEqual('data:text/plain;base64,aGVsbG8=');
  });

  ///////////////////////////////////////////////////////////////
  // READ FILE AS DATA URL
  it('readFileContentHasUint8Array', async () => {
    const tFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    const tData = await CFFileHelper.readFileContentHasUint8Array(tFile);
    expect(tData).toEqual(new Uint8Array([104, 101, 108, 108, 111]));
  });
});
