// src/index.ts
export * from './pkg/bvault_js_rs.js';
export { encrypt, decrypt } from './lib/crypto.js';
export { EncryptionError, DecryptionError } from './lib/errors.js';
export {
  isSecureStorageInitialized,
  secureLocalStorage,
  initializeSecureStorage,
} from './lib/local-storage.js';
