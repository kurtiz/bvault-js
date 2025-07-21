# bvault-js

## 0.1.0

### Minor Changes

- e6afc81: ## v0.0.1 - Initial Release

  ### ✨ Features:
  - Added secure AES-GCM 256-bit encryption/decryption
  - Implemented PBKDF2 key derivation (100k iterations)
  - Included browser-compatible Base64 URL-safe encoding
  - Added TypeScript support with full type definitions
  - Comprehensive error handling (EncryptionError/DecryptionError)

  ### 🛠️ Technical:
  - Zero dependencies - pure Web Crypto API implementation
  - ESM module format for modern browsers
  - Full test coverage with Vitest (100% coverage target)
  - Built-in data conversion utilities

  ### 📦 Package:
  - Ready for npm publishing
  - Includes browser and TypeScript type declarations
  - Demo/test application included in documentation

  ### 🔒 Security:
  - Randomized IV/salt for each operation
  - Fail-secure error handling
  - Resistance to common cryptographic attacks
