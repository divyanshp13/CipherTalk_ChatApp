import forge from 'node-forge';
import CryptoJS from 'crypto-js';

export class CryptoEngine {
  constructor() {
    this.keySize = 2048;
    this.userId = null;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  getStorageKey() {
    return this.userId ? `cipherTalk_privateKey_${this.userId}` : 'cipherTalk_privateKey';
  }

  // 1. RSA KEY PAIR GENERATION & STORAGE
  async generateKeyPair() {
    return new Promise((resolve, reject) => {
      console.log("CYPHER_START: Generating Key Pair using Forge (Strict Mode)...");
      try {
        // Enforcing forge for 100% interoperability. WebCrypto SPKI has subtle browser mismatches with Forge OAEP.
        forge.pki.rsa.generateKeyPair({ bits: this.keySize, e: 0x10001, workers: -1 }, (err, keypair) => {
           if (err) {
             console.error("CYPHER ERROR: Forge Failed", err);
             return reject(err);
           }
           try {
             const pubPem = forge.pki.publicKeyToPem(keypair.publicKey);
             const privPem = forge.pki.privateKeyToPem(keypair.privateKey);
             localStorage.setItem(this.getStorageKey(), privPem);
             console.log("CYPHER_END: Fully Resolved via Forge");
             resolve({ publicKey: pubPem, privateKey: privPem });
           } catch(e) { 
             console.error("CYPHER ERROR: Forge Pem Failed", e);
             reject(e);
           }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  getPrivateKey() {
    const pem = localStorage.getItem(this.getStorageKey());
    if (!pem) return null;
    return forge.pki.privateKeyFromPem(pem);
  }

  getPublicKeyPemFromStorage() {
    const pem = localStorage.getItem(this.getStorageKey());
    if (!pem) return null;
    const privateKey = forge.pki.privateKeyFromPem(pem);
    const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
    return forge.pki.publicKeyToPem(publicKey);
  }

  // 2. SESSION KEY GENERATION
  generateSessionKey() {
    // Generate a 256-bit (32 byte) random key for AES
    return forge.util.bytesToHex(forge.random.getBytesSync(32));
  }

  // 3. ASYMMETRIC ENCRYPTION (Encrypting Session Key with RSA)
  encryptSessionKey(sessionKey, recipientPublicKeyPem) {
    const publicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);
    const encrypted = publicKey.encrypt(sessionKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() }
    });
    return forge.util.encode64(encrypted);
  }

  decryptSessionKey(encryptedSessionKeyBase64) {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw new Error("Private key not found");
    
    const encryptedBytes = forge.util.decode64(encryptedSessionKeyBase64);
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() }
    });
    return decrypted;
  }

  // 4. DOUBLE LAYER SYMMETRIC ENCRYPTION (Message Content)
  // Layer 1: AES-256
  // Layer 2: DES (Using TripleDES in crypto-js for better security than plain DES, but fulfills the DES requirement)
  encryptMessageContent(plaintext, sessionKey) {
    // Layer 1: AES
    const aesEncrypted = CryptoJS.AES.encrypt(plaintext, sessionKey).toString();
    // Layer 2: DES (TripleDES)
    const doubleEncrypted = CryptoJS.TripleDES.encrypt(aesEncrypted, sessionKey).toString();
    
    return doubleEncrypted;
  }

  decryptMessageContent(ciphertext, sessionKey) {
    try {
      // Layer 2 Decrypt: DES
      const desDecrypted = CryptoJS.TripleDES.decrypt(ciphertext, sessionKey).toString(CryptoJS.enc.Utf8);
      // Layer 1 Decrypt: AES
      const aesDecrypted = CryptoJS.AES.decrypt(desDecrypted, sessionKey).toString(CryptoJS.enc.Utf8);
      
      return aesDecrypted;
    } catch (e) {
      console.error("Decryption failed:", e);
      return null; // Decryption failed
    }
  }

  // 5. MESSAGE HASHING & INTEGRITY (SHA-256)
  generateHash(messageContent, senderId) {
    const timestamp = new Date().toISOString().slice(0, 10); // Hash based on day to avoid strict ms matching issues if sent time differs slightly from DB, or just exclude timestamp
    // For exact match, we just hash the content and senderId
    const dataToHash = messageContent + senderId;
    return CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);
  }

  verifyHash(messageContent, senderId, providedHash) {
    const computedHash = this.generateHash(messageContent, senderId);
    return computedHash === providedHash;
  }

  // 6. DIGITAL SIGNATURES (RSA)
  signData(dataString) {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw new Error("Private key not found");

    const md = forge.md.sha256.create();
    md.update(dataString, 'utf8');
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature);
  }

  verifySignature(dataString, signatureBase64, senderPublicKeyPem) {
    try {
      const publicKey = forge.pki.publicKeyFromPem(senderPublicKeyPem);
      const signatureBytes = forge.util.decode64(signatureBase64);
      
      const md = forge.md.sha256.create();
      md.update(dataString, 'utf8');
      
      return publicKey.verify(md.digest().bytes(), signatureBytes);
    } catch (e) {
      console.error("Signature verification failed:", e);
      return false;
    }
  }

  // Helper to compare keys
  checkKeyMatch(localPem, serverPem) {
    try {
        if (!localPem || !serverPem) return false;
        const pk1 = forge.pki.publicKeyFromPem(localPem);
        const pk2 = forge.pki.publicKeyFromPem(serverPem);
        return pk1.n.toString() === pk2.n.toString() && pk1.e.toString() === pk2.e.toString();
    } catch (e) {
        console.warn("Key comparison error:", e);
        // Fallback to basic string comparison if parsing fails
        return localPem.replace(/\\s+/g, '') === serverPem.replace(/\\s+/g, '');
    }
  }
}

export const cryptoEngine = new CryptoEngine();
