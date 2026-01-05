/**
 * Test setup and mocks
 */

// Mock crypto for tests
if (typeof crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array | Uint32Array) => {
      return nodeCrypto.randomFillSync(arr);
    },
    subtle: nodeCrypto.webcrypto.subtle,
  };
}

// Mock btoa/atob for Node environment
if (typeof btoa === 'undefined') {
  (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof atob === 'undefined') {
  (global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}
