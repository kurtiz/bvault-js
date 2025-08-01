// src/lib/local-storage.ts

import BVaultDB from './bvault-db.js';
import { decrypt, encrypt } from './crypto.js';
import { DecryptionError } from './errors.js';

const SECURE_STORAGE_VERSION = 1;
const METADATA_STORE = 'encryption_metadata';
let isInitialized = false;
let encryptionPassword = '';
const encryptionMetadataCache = new Map<string, { iv: string; salt: string }>();
let originalSetItem = localStorage.setItem;
let originalGetItem = localStorage.getItem;
let originalRemoveItem = localStorage.removeItem;
let originalClear = localStorage.clear;

/**
 * Initializes secure storage by setting up the encryption password and verifying
 * the database connection. This must be called before using secure storage functions.
 *
 * @param {string} password - The encryption password used for securing storage.
 *
 * @throws {Error} If no password is provided or if initialization fails.
 *
 * @returns {Promise<void>} A promise that resolves when secure storage is successfully initialized.
 */
export const initializeSecureStorage = async (
  password: string,
): Promise<void> => {
  if (isInitialized) return;

  if (!password) {
    throw new Error('Invalid encryption password');
  }

  encryptionPassword = password;

  try {
    await BVaultDB.initialize();
    await testDatabaseConnection();
    isInitialized = true;
  } catch (error) {
    const caughtError = error as Error;
    console.error('SecureStorage initialization failed:', caughtError.message);
    throw new Error(
      `Secure storage initialization failed: ${caughtError.message}`,
    );
  }
};

/**
 * Tests the connection to the IndexedDB database by writing a test record and
 * immediately deleting it. If the operation fails, the record is deleted
 * anyway and the error is re-thrown.
 *
 * @throws {Error} If the database connection test fails.
 *
 * @returns {Promise<void>} A promise that resolves when the test succeeds.
 */
async function testDatabaseConnection(): Promise<void> {
  const testKey = '__connection_test__';
  const testValue = { iv: 'test', salt: 'test' };

  try {
    await BVaultDB.storeData(METADATA_STORE, { key: testKey, ...testValue });
    const result = await BVaultDB.getData<{ iv: string; salt: string }>(
      METADATA_STORE,
      testKey,
    );
    if (!result) {
      throw new Error('Failed to verify database connection');
    }
    await BVaultDB.deleteData(METADATA_STORE, testKey);
  } catch (error) {
    await BVaultDB.deleteData(METADATA_STORE, testKey).catch(() => {});
    throw error;
  }
}

/**
 * Converts a value to a string representation.
 *
 * If the value is an object, it is serialized to a JSON string. If it is a
 * primitive value, it is converted to a string using the `String()` function.
 *
 * @param {unknown} value - The value to convert
 * @returns {string} A string representation of the value
 */
const processValue = (value: unknown): string => {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * Stores encrypted data in localStorage and metadata in IndexedDB
 */
const secureSetItem = async (key: string, value: unknown): Promise<void> => {
  if (!isInitialized) {
    throw new Error(
      'Secure storage not initialized. Call initializeSecureStorage() first.',
    );
  }

  try {
    const processedValue = processValue(value);
    const encryptionResult = await encrypt(processedValue, encryptionPassword);

    originalSetItem.call(localStorage, key, encryptionResult.encryptedData);

    const metadata = { iv: encryptionResult.iv, salt: encryptionResult.salt };
    encryptionMetadataCache.set(key, metadata);
    await BVaultDB.storeData(METADATA_STORE, { key, ...metadata });
  } catch (error) {
    console.error(`secureSetItem internal error for key "${key}":`, error);
    throw new Error(`Secure storage setItem failed for key "${key}"`);
  }
};

/**
 * Retrieves a decrypted value from secure storage.
 *
 * @throws {Error} if secure storage is not initialized
 * @throws {DecryptionError} if decryption fails
 * @throws {Error} if data retrieval fails
 *
 * @param {string} key
 * @returns {Promise<string | null>}
 */
const secureGetItem = async (key: string): Promise<string | null> => {
  if (!isInitialized) {
    throw new Error(
      'Secure storage not initialized. Call initializeSecureStorage() first.',
    );
  }

  const encryptedValue = originalGetItem.call(localStorage, key);
  if (!encryptedValue) return null;

  try {
    const metadata = encryptionMetadataCache.get(key);
    if (!metadata) {
      throw new Error(`No encryption metadata found for key "${key}"`);
    }

    return await decrypt(
      encryptedValue,
      encryptionPassword,
      metadata.iv,
      metadata.salt,
    );
  } catch (error) {
    if (error instanceof DecryptionError) {
      console.error(`Decryption failed for key "${key}":`, error.message);
    } else {
      console.error(`Data retrieval failed for key "${key}":`, error);
    }

    originalRemoveItem.call(localStorage, key);
    encryptionMetadataCache.delete(key);
    BVaultDB.deleteData(METADATA_STORE, key).catch(console.error);

    return null;
  }
};

/**
 * Removes a key from secure storage and its associated encryption metadata.
 *
 * @throws {Error} if data removal fails
 *
 * @param {string} key
 * @returns {void}
 */
const secureRemoveItem = (key: string): void => {
  originalRemoveItem.call(localStorage, key);
  encryptionMetadataCache.delete(key);
  BVaultDB.deleteData(METADATA_STORE, key).catch(console.error);
};

/**
 * Removes all items from secure storage and clears associated encryption metadata.
 *
 * @throws {Error} if data removal fails
 *
 * @returns {void}
 */
const secureClear = (): void => {
  originalClear.call(localStorage);
  encryptionMetadataCache.clear();
  BVaultDB.clearStore(METADATA_STORE).catch(console.error);
};

export const secureLocalStorage = {
  setItem: secureSetItem,
  getItem: secureGetItem,
  removeItem: secureRemoveItem,
  clear: secureClear,
};

/**
 * Checks whether secure storage has been initialized with a password.
 *
 * @returns {boolean} true if secure storage is initialized, false otherwise
 */
export const isSecureStorageInitialized = (): boolean => isInitialized;
