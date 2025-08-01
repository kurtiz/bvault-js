// src/index.ts

export { encrypt, decrypt } from './lib/crypto.js';
export { EncryptionError, DecryptionError } from './lib/errors.js';
export {
  isSecureStorageInitialized,
  secureLocalStorage,
  initializeSecureStorage,
} from './lib/local-storage.js';
