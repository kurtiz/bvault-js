import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decrypt, DecryptionError, encrypt, EncryptionError } from '../src/index.js';
import {
  base64ToBuffer,
  bufferToBase64,
  bufferToString,
  stringToBuffer,
} from '../src/lib/converters.js';

// Store original crypto for integration tests
const originalCrypto = global.crypto;

// Mock Web Crypto API
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
};

// Real implementation helper for integration tests
async function withRealCrypto<T>(fn: () => Promise<T>): Promise<T> {
  const current = global.crypto;
  global.crypto = originalCrypto;
  try {
    return await fn();
  } finally {
    global.crypto = current;
  }
}

describe('Encryption Library', () => {
  describe('Unit Tests (Mocked)', () => {
    beforeEach(() => {
      global.crypto = mockCrypto as any;
      vi.clearAllMocks();

      // Reset to default implementations
      mockCrypto.getRandomValues.mockImplementation((buffer) => {
        const arr = new Uint8Array(buffer.byteLength);
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      });
    });

    it('should throw EncryptionError on failure', async () => {
      // Mock encryption failure
      mockCrypto.subtle.encrypt.mockRejectedValueOnce(
        new Error('Encryption failed'),
      );

      await expect(encrypt('data', 'pass')).rejects.toThrow(EncryptionError);
    });

    it('should throw DecryptionError on failure', async () => {
      // Mock decryption failure
      mockCrypto.subtle.decrypt.mockRejectedValueOnce(
        new Error('Decryption failed'),
      );

      await expect(decrypt('encrypted', 'pass', 'iv', 'salt')).rejects.toThrow(
        DecryptionError,
      );
    });
  });

  describe('Integration Tests (Real Crypto)', () => {
    it('should encrypt data successfully', async () => {
      const result = await withRealCrypto(async () => {
        return await encrypt('secret data', 'password123');
      });

      expect(result).toEqual({
        encryptedData: expect.any(String),
        iv: expect.any(String),
        salt: expect.any(String),
      });

      // Verify base64 format
      expect(result.iv).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(result.salt).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(result.encryptedData).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should decrypt data successfully', async () => {
      // Create encrypted data and decrypt it
      const result = await withRealCrypto(async () => {
        const encrypted = await encrypt('test message', 'pass123');
        const decrypted = await decrypt(
          encrypted.encryptedData,
          'pass123',
          encrypted.iv,
          encrypted.salt,
        );
        return decrypted;
      });

      expect(result).toBe('test message');
    });

    it('should fail with wrong password', async () => {
      await withRealCrypto(async () => {
        const encrypted = await encrypt('test message', 'correct-pass');

        await expect(
          decrypt(
            encrypted.encryptedData,
            'wrong-pass',
            encrypted.iv,
            encrypted.salt,
          ),
        ).rejects.toThrow(DecryptionError);
      });
    });

    it('should fail with tampered IV', async () => {
      await withRealCrypto(async () => {
        const encrypted = await encrypt('test message', 'pass');
        const tamperedIV = bufferToBase64(new Uint8Array(12).buffer); // Zeroed IV

        await expect(
          decrypt(encrypted.encryptedData, 'pass', tamperedIV, encrypted.salt),
        ).rejects.toThrow(DecryptionError);
      });
    });
  });

  describe('Data Conversion', () => {
    it('should round-trip buffer/base64 conversion', () => {
      const original = new Uint8Array([1, 2, 3, 4, 255, 0, 128]).buffer;
      const base64 = bufferToBase64(original);
      const roundTripped = new Uint8Array(base64ToBuffer(base64));

      expect(roundTripped).toEqual(new Uint8Array([1, 2, 3, 4, 255, 0, 128]));
    });

    it('should handle special characters in text conversion', () => {
      const text = 'Hello 世界! 👋';
      const buffer = stringToBuffer(text);
      const result = bufferToString(buffer);

      expect(result).toBe(text);
    });
  });

  describe('Error Handling', () => {
    it('should throw EncryptionError with custom message', () => {
      const error = new EncryptionError('Custom message');
      expect(error.message).toBe('Custom message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should throw DecryptionError with custom message', () => {
      const error = new DecryptionError('Invalid key');
      expect(error.message).toBe('Invalid key');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
