/**
 * Custom errors for encryption and decryption operations
 * @module errors
 */
export class EncryptionError extends Error {
  constructor(message = 'Encryption failed') {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Custom errors for encryption and decryption operations
 * @module errors
 */
export class DecryptionError extends Error {
  constructor(message = 'Decryption failed') {
    super(message);
    this.name = 'DecryptionError';
  }
}
