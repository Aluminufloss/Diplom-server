import crypto from "crypto";

const cryptoSecretKey = process.env.CRYPTO_SECRET_KEY as string;
const cryptoAlgorithm = process.env.CRYPTO_ALGORITHM as string;

interface KeyAndIv {
  key: string;
  iv: Buffer;
}

function getKeyAndIv(): KeyAndIv {
  return {
    key: crypto
      .createHash("sha256")
      .update(String(cryptoSecretKey))
      .digest("base64")
      .substr(0, 32),
    iv: crypto.randomBytes(16),
  };
}

function encryptAndFormatAsUuid(email: string): string {
  const { key, iv } = getKeyAndIv();
  const cipher = crypto.createCipheriv(cryptoAlgorithm, key, iv);
  let encrypted = cipher.update(email, "utf8", "hex");
  encrypted += cipher.final("hex");

  encrypted += iv.toString("hex");
  return `${encrypted.substr(0, 8)}-${encrypted.substr(
    8,
    4
  )}-${encrypted.substr(12, 4)}-${encrypted.substr(16, 4)}-${encrypted.substr(
    20
  )}`;
}

function decryptFormattedUuid(encryptedUuid: string): string | null {
  const encryptedWithIv = encryptedUuid.replace(/-/g, "");
  const encrypted = encryptedWithIv.substr(0, encryptedWithIv.length - 32);
  const ivHex = encryptedWithIv.substr(encryptedWithIv.length - 32, 32);

  const { key } = getKeyAndIv();
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(cryptoAlgorithm, key, iv);
  try {
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

export { encryptAndFormatAsUuid, decryptFormattedUuid };
