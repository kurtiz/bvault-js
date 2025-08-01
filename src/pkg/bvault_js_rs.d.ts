/* tslint:disable */
/* eslint-disable */
/**
 * Synchronously decrypts a base64-encoded ciphertext using a password,
 * a base64-encoded IV, and a base64-encoded salt.
 *
 * # Errors
 *
 * - If the inputs are invalid base64, an error is returned.
 * - If the IV is not 16 bytes, an error is returned.
 * - If the key derivation, decryption or padding fails, an error is returned.
 * - If the decrypted bytes are not valid utf-8, an error is returned.
 */
export function decrypt_sync(b64_ciphertext: string, password: string, b64_iv: string, b64_salt: string): string;
