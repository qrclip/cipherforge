/////////////////////////////////////////////////
// COMMANDS
export enum CFQRReadWorkerCommandType {
  ERROR_BAD_COMMAND = 0,
  READ_QR_CODE = 1,
}

export enum CFQRReadWorkerCMDReadType {
  NONE = 0,
  BINARY = 1,
  STRING = 2,
}

export interface CFQRReadWorkerCMDRead {
  type: CFQRReadWorkerCMDReadType;
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface CFQRReadWorkerCommand {
  cmd: CFQRReadWorkerCommandType;
  read?: CFQRReadWorkerCMDRead;
}

/////////////////////////////////////////////////
// RESPONSES
export interface CFQRReadWorkerResponse {
  cmd: CFQRReadWorkerCommandType;
  dataArray?: Uint8Array;
  dataString?: string;
  error?: boolean;
}
