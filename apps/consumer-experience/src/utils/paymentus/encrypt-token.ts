import crypto from 'crypto';

/**
 * Pads the input text to ensure its length is a multiple of the specified block size.
 * @param {string} text - The text to pad.
 * @param {number} blockSize - The block size to pad to.
 * @returns {string} The padded text.
 */
function padRightToMod(text: string, blockSize: number) {
  const paddingLength = blockSize - (text.length % blockSize);
  return text + ' '.repeat(paddingLength);
}

function iframeDataToString(data: Record<string, unknown>) {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join(';');
}

/**
 * Encrypts the given text using AES encryption in ECB mode without built-in padding.
 * Uses requirements from paymentus, the full paymentus documentation can be found in this
 * confluence doc https://zinnia.atlassian.net/wiki/spaces/AU/pages/5199265793/Paymentus+Integration+into+MyPolicyView+for+Farmers
 * @param {string} text - The text to encrypt.
 * @param {string} hexKey - The encryption key in HEX format.
 * @returns {string} The encrypted data as a HEX string.
 */
export function getPaymentusIframeToken(
  paymentInputs: Record<string, unknown>
) {
  const text = iframeDataToString(paymentInputs);
  const hexKey = process.env.FARMERS_IFRAME_KEY;
  if (!hexKey || hexKey.length !== 32) {
    if (!hexKey) {
      throw new Error('Missing key');
    }

    throw new Error(
      'Invalid key length. Key must be 32 hexadecimal characters (16 bytes).'
    );
  }

  // Store key in memory as a bite array
  const key = Buffer.from(hexKey, 'hex');
  // AES is a specific implementation of Rijndael algorithm (required by Paymentus)
  // it includes the contstraint of the key: either 128, 192 or 256 bits
  const algorithm = 'aes-128-ecb';
  const paddedText = padRightToMod(text, 32); // Pad the text to a multiple of 16

  const cipher = crypto.createCipheriv(algorithm, key, null);
  cipher.setAutoPadding(false); // Disable auto-padding to handle manual padding

  // Do the encryption cipher.update(data[, inputEncoding][, outputEncoding])
  let encrypted = cipher.update(paddedText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Manually pad the encrypted string to a multiple of 32 characters
  // The paymentus documentation indicates that we should padd the resultant
  // string after encryption, however, following the farmers example, we're
  // padding the text before encryption. Leaving this here for now while
  // we go through testing
  // const paddedEncrypted = padRightToMod(encrypted, 32);

  return encrypted.toUpperCase();
}
