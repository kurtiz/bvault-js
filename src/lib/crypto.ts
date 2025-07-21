import {
  stringToBuffer,
  bufferToString,
  base64ToBuffer,
  bufferToBase64,
} from './converters.js';
import { EncryptionError, DecryptionError } from './errors.js';

// Configuration constants
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16;

export const generateSalt = (): ArrayBuffer => {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
};

export const deriveKey = async (
  password: string,
  salt: ArrayBuffer | Uint8Array,
  usages: KeyUsage[],
): Promise<CryptoKey> => {
  const importedKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    importedKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    usages,
  );
};

export const encrypt = async (
  data: string,
  password: string,
): Promise<{ encryptedData: string; iv: string; salt: string }> => {
  try {
    const salt = generateSalt();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt, ['encrypt']);

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      stringToBuffer(data),
    );

    return {
      encryptedData: bufferToBase64(encrypted),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
    };
  } catch (error) {
    throw new EncryptionError();
  }
};

export const decrypt = async (
  encryptedData: string,
  password: string,
  iv: string,
  salt: string,
): Promise<string> => {
  try {
    const saltBuffer = new Uint8Array(base64ToBuffer(salt));
    const key = await deriveKey(password, saltBuffer, ['decrypt']);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: new Uint8Array(base64ToBuffer(iv)) },
      key,
      new Uint8Array(base64ToBuffer(encryptedData)),
    );

    return bufferToString(decrypted);
  } catch (error) {
    throw new DecryptionError();
  }
};
