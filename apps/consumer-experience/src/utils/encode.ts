import crypto, { subtle } from 'crypto';

async function generateAesKey(length = 256) {
  const key = await subtle.generateKey(
    {
      name: 'AES-CBC',
      length,
    },
    true,
    ['encrypt', 'decrypt']
  );

  return key;
}

// AES is the same as rijndael with difference in block and cipher key length
// AES fixes block length to 128 bits and supports 128, 192, 256 only
async function aesEncrypt(plaintext: string) {
  const ec = new TextEncoder();
  const key = await generateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const ciphertext = await crypto.subtle.encrypt(
    {
      // According to docs, this is requested method
      name: 'AES-GCM',
      iv,
    },
    key,
    ec.encode(plaintext)
  );

  return {
    key,
    iv,
    ciphertext,
  };
}
