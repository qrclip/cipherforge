export interface CipherforgeKey {
  array?: Uint8Array;
  hex?: string;
  error?: boolean;
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

/////////////////////////////////////////////////
// COMMANDS
export enum CFCryptoWorkerCommandType {
  ERROR_BAD_COMMAND = 0,
  GENERATE_RANDOM_KEY = 1,
  GENERATE_KEY_FROM_PASSWORD_AND_KEY = 2,
  GENERATE_KEY_FROM_PASSWORD = 3,
  GENERATE_RANDOM_PASSWORD_SALT = 4,
  ENCRYPT_BUFFER = 5,
  DECRYPT_BUFFER = 6,
}

export interface CFCryptoWorkerCMDKeyFromPassAndKey {
  passwordOptions: CipherforgeOptionsPassword;
  key: Uint8Array;
}

export interface CFCryptoWorkerCMDKeyFromPass {
  passwordOptions: CipherforgeOptionsPassword;
}

export interface CFCryptoWorkerCMDEncryptBuffer {
  data: Uint8Array;
  key: Uint8Array;
}

export interface CFCryptoWorkerCMDDecryptBuffer {
  data: Uint8Array;
  key: Uint8Array;
}

export interface CFCryptoWorkerCommand {
  cmd: CFCryptoWorkerCommandType;
  key?: CipherforgeKey;
  keyFromPassAndKey?: CFCryptoWorkerCMDKeyFromPassAndKey;
  keyFromPass?: CFCryptoWorkerCMDKeyFromPass;
  encryptBuffer?: CFCryptoWorkerCMDEncryptBuffer;
  decryptBuffer?: CFCryptoWorkerCMDDecryptBuffer;
  dataArray?: Uint8Array;
  dataString?: string;
}

/////////////////////////////////////////////////
// RESPONSES
export interface CFCryptoWorkerResponse {
  cmd: CFCryptoWorkerCommandType;
  key?: CipherforgeKey;
  salt?: Uint8Array;
  dataArray?: Uint8Array;
  dataString?: string;
  error?: boolean;
}
