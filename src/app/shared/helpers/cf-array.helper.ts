export class CFArrayHelper {
  //////////////////////////////////////////////////////
  // JOIN ARRAY
  public static joinArray(tA: Uint8Array, tB: Uint8Array): Uint8Array {
    const tFinalArray = new Uint8Array(tA.length + tB.length);
    tFinalArray.set(tA);
    tFinalArray.set(tB, tA.length);
    return tFinalArray;
  }

  //////////////////////////////////////////////////////
  // HEX STRING TO ARRAY
  public static hexStringToArray(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
      throw new Error('Invalid hexString');
    }

    const bytes = new Uint8Array(hexString.length / 2);

    for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
      bytes[j] = parseInt(hexString.substring(i, i + 2), 16);
    }

    return bytes;
  }

  //////////////////////////////////////////////////////
  // ARRAY TO STRING
  public static arrayToHexString(array: Uint8Array): string {
    return Array.from(array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  //////////////////////////////////////////////////////
  // STRING TO ARRAY
  public static stringToArray(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  ////////////////////////////////////////////////////////////
  // ARRAY TO STRING
  public static arrayToString(array: Uint8Array): string {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true });
      return decoder.decode(array);
    } catch (_) {
      /* istanbul ignore next */
      return '';
    }
  }

  //////////////////////////////////////////////////////
  // OFFSET ARRAY
  public static offsetArray(array: Uint8Array, offset: number): Uint8Array {
    // Create a new Uint8Array to hold the offset result
    const result = new Uint8Array(array.length);

    // Calculate the effective offset considering the array length
    const effectiveOffset = ((offset % array.length) + array.length) % array.length;

    // Copy the array into the result with the offset
    for (let i = 0; i < array.length; i++) {
      const newPosition = (i + effectiveOffset) % array.length;
      result[newPosition] = array[i];
    }

    return result;
  }
}
