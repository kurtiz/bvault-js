// Polyfill for Web Crypto API in Node.js environment
const { webcrypto } = eval('require')('crypto');

// Set up global crypto for tests
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: true,
});

// Set up text encoding/decoding globals
Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
  writable: true,
});

Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder,
  writable: true,
});

// Mock functions for browser APIs
Object.defineProperty(global, 'atob', {
  value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
  writable: true,
});

Object.defineProperty(global, 'btoa', {
  value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  writable: true,
});
