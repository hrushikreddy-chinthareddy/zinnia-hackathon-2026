import crypto from 'crypto';

const algorithm = 'aes-256-cbc'; // AES with 256-bit key in CBC mode
const ivLength = 16; // IV must be 16 bytes for AES-CBC

// const base64Key = 'cwlyVCCl+n8yC0Sg3wWYdZDiFqspxucrVCeQaVLwFjo='; // Replace with actual key

// Function to encrypt data using AES-256-CBC
function encryptData(
    plainText: string,
    base64Key: string
): { encrypted: string; iv: string } {
    const key = Uint8Array.from(Buffer.from(base64Key, 'base64')); // Decode Base64 key
    const iv = crypto.randomBytes(ivLength); // Generate a new IV
    const cipher = crypto.createCipheriv(algorithm, key, Uint8Array.from(iv));

    let encrypted = cipher.update(plainText, 'utf-8', 'base64');
    encrypted += cipher.final('base64');

    return {
        encrypted,
        iv: iv.toString('base64'), // IV must be stored/sent with the ciphertext
    };
}

// Function to decrypt data using AES-256-CBC
export function decryptData(
    encryptedText: string,
    ivBase64: string,
    base64Key: string
): string {
    const key = Uint8Array.from(Buffer.from(base64Key, 'base64')); // Decode Base64 key
    const iv = Buffer.from(ivBase64, 'base64'); // Decode IV from Base64
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Uint8Array.from(iv)
    );

    let decrypted = decipher.update(encryptedText, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

export function encryptWellabeToppanMerrill(plainText: string) {
    return encryptData(plainText, process.env.WELLABE_TOPPAN_MERRILL_KEY || '');
}
