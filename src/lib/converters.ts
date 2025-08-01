// src/lib/converters.ts

// Text <-> ArrayBuffer conversion
/**
 * Converts a string to an ArrayBuffer
 * @param str
 * @returns ArrayBuffer
 */
export const stringToBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str);
};

/**
 * Converts an ArrayBuffer to a string
 * @param buffer
 * @returns string
 */
export const bufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

// Base64 URL-safe encoding
/**
 * Converts a base64 string to an ArrayBuffer
 * @param base64
 * @returns ArrayBuffer
 */
export const base64ToBuffer = (base64: string): ArrayBuffer => {
  // Convert URL-safe base64 to standard base64
  let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const padding = standardBase64.length % 4;
  if (padding) {
    standardBase64 += '='.repeat(4 - padding);
  }

  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

/**
 * Converts an ArrayBuffer to a base64 string
 * @param buffer
 * @returns string
 */
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const binaryString = String.fromCharCode(...bytes);
  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
