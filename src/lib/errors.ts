// src/lib/errors.ts

/**
 * Custom error for encryption failures
 */
export class EncryptionError extends Error {
  constructor(
    message = 'Encryption failed',
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'EncryptionError';

    if (cause instanceof Error && cause.stack) {
      this.stack += '\nCaused by: ' + cause.stack;
    }
  }
}

/**
 * Custom error for decryption failures
 */
export class DecryptionError extends Error {
  constructor(
    message = 'Decryption failed',
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'DecryptionError';

    if (cause instanceof Error && cause.stack) {
      this.stack += '\nCaused by: ' + cause.stack;
    }
  }
}
