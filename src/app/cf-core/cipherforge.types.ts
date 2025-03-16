import { CipherforgeKey } from '../../../workers/cipherforge-crypto-worker/src/cipherforge-crypto-lib.types';

export const CIPHER_FORGE_VERSION = 1;
export const CIPHER_FORGE_SIGNATURE_LENGTH = 3;
export const CIPHER_FORGE_SIGNATURE = 'CFF'; // IMPORTANT: MUST BE SAME SIZE HAS CIPHER_FORGE_SIGNATURE_LENGTH
export const CIPHER_FORGE_CHUNK_HEADER_SIG = 'CFC'; // IMPORTANT: MUST BE SAME SIZE HAS CIPHER_FORGE_SIGNATURE_LENGTH
export const CIPHER_FORGE_CHUNK_HEADER_SIZE = 7;
export const CIPHER_FORGE_PASSWORD_SALT_SIZE_LENGTH = 16;

export const CF_ADD_QRCODE_DECODE_DATA_ERROR_NOT_READY = -1;
export const CF_ADD_QRCODE_DECODE_DATA_ERROR_SIZE = -2;
export const CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_SIGNATURE = -3;
export const CF_ADD_QRCODE_DECODE_DATA_ERROR_CHUNK_INDEX_OVERFLOW = -4;
export const CF_ADD_QRCODE_DECODE_DATA_WARNING_ALREADY_EXISTS = -5;

export interface CipherforgeDecodeDataChunk {
  index: number;
  data: Uint8Array;
}

export interface CipherforgeDecodeData {
  chunkCount: number;
  mode: CipherforgeMode;
  version: number;
  chunks: CipherforgeDecodeDataChunk[];
  key?: CipherforgeKey;
  passOptions?: CipherforgeOptionsPassword;
}

export interface CipherforgeEncodeData {
  mode: CipherforgeMode;
  dataArray?: Uint8Array;
  chunkCount: number;
}

export enum CipherforgeMode {
  EMPTY = 0,
  NONE = 10,
  KEY = 20,
  KEY_AND_PASSWORD = 30,
  PASSWORD_ONLY = 40,
}

export enum CipherforgeEncodeError {
  OK = 0,
  ENCRYPTING_DATA = 1,
  FILENAME_TO_BIG = 2,
  TO_MANY_FILES = 3,
}

export interface CipherforgePassLevel {
  ops: number;
  mem: number;
}

export interface CipherforgeOptionsPassword {
  level: CipherforgePassLevel;
  password?: string;
  salt?: Uint8Array;
}

export interface CipherforgeEncodeOptions {
  password?: CipherforgeOptionsPassword;
  key?: CipherforgeKey;
  version: CFQRCodeVersion;
  errorCorrection: CFErrorCorrectionLevel;
}

export enum CipherforgeDecodeResultError {
  NO_VALID_SIGNATURE = 1,
  NOT_ENOUGH_DATA = 2,
  NO_VALID_PASSWORD_DATA = 3,
  HIGHER_VERSION = 4,
  EXISTING_CHUNKS_OVERFLOW = 5,
}

export interface CipherforgeDecodeResult {
  error?: CipherforgeDecodeResultError;
  data?: {
    chunkCount: number;
    version: number;
    mode: CipherforgeMode;
  };
}

export interface CipherforgeAddQRCodeDataResult {
  first?: CipherforgeDecodeResult;
  chunk?: number;
  error?: boolean;
}

export interface CipherforgeDecoded {
  error?: CipherforgeDecodedError;
  text?: string;
  files?: CipherforgeFile[];
}

export enum CipherforgeDecodedError {
  FAILED_TO_CREATE_KEY = 1,
  FAILED_TO_MERGE_DATA = 2,
  NO_DECODE_DATA = 3,
  FAILED_TO_DECODE_DATA = 4,
  FAILED_TO_DECOMPRESS_DATA = 5,
  FAILED_TO_DECRYPT_DATA = 6,
}

export enum CipherforgeDecodeDataReady {
  OK = 0,
  NO_DECODE_DATA = 1,
  CHUNKS_MISSING = 2,
  NO_KEY = 3,
  NO_PASSWORD = 4,
}

export interface CipherforgeFile {
  name: string;
  data: Uint8Array;
}

export const CF_DEFAULT_PASS_LEVEL_OPS = 3;
export const CF_DEFAULT_PASS_LEVEL_MEM = 3;

export interface CipherforgeStatus {
  chunkCount: number;
  chunks: number[];
}

export interface CipherforgeEncodedChunk {
  data: Uint8Array;
  version: CFQRCodeVersion;
  errorCorrection: CFErrorCorrectionLevel;
  error?: boolean;
}

export type CFQRCodeVersion = '10' | '20' | '30' | '40';
export type CFErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
