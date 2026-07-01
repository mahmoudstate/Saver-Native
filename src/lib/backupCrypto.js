// Encrypted backup: AES-256-GCM with a key derived from the user's password
// via PBKDF2 (SHA-256). Pure WebCrypto — no native plugin needed.
// File format (.saver): JSON envelope with base64 salt / iv / ciphertext.

const MAGIC = "SAVER-ENC";
const VERSION = 1;
const ITER = 200000;

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// payload: any JSON-serialisable object -> encrypted envelope string
export async function encryptBackup(payload, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(payload)),
  );
  return JSON.stringify({
    _magic: MAGIC, _version: VERSION, kdf: "PBKDF2", iter: ITER,
    salt: b64(salt), iv: b64(iv), data: b64(cipher),
  });
}

export function isEncryptedBackup(text) {
  try { return JSON.parse(text)?._magic === MAGIC; } catch { return false; }
}

// envelope string + password -> original payload object (throws on wrong password)
export async function decryptBackup(text, password) {
  const env = JSON.parse(text);
  if (env?._magic !== MAGIC) throw new Error("not-encrypted");
  const key = await deriveKey(password, unb64(env.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(env.iv) },
    key,
    unb64(env.data),
  );
  return JSON.parse(dec.decode(plain));
}
