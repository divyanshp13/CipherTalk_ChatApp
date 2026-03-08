import forge from 'node-forge';
import crypto from 'crypto';

async function test() {
    // Generate WebCrypto like keys (in Node, using crypto module)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    console.log("Keys generated natively.");
    
    const sessionKey = forge.random.getBytesSync(32);
    
    // Encrypt using forge
    const forgePubKey = forge.pki.publicKeyFromPem(publicKey);
    const encrypted = forgePubKey.encrypt(sessionKey, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: { md: forge.md.sha256.create() }
    });
    
    const encryptedBase64 = forge.util.encode64(encrypted);
    
    // Decrypt using forge
    const forgePrivKey = forge.pki.privateKeyFromPem(privateKey);
    const encryptedBytes = forge.util.decode64(encryptedBase64);
    
    try {
        const decrypted = forgePrivKey.decrypt(encryptedBytes, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: { md: forge.md.sha256.create() }
        });
        console.log("Decrypted successfully:", decrypted === sessionKey);
    } catch(err) {
        console.error("Decryption failed:", err.message);
    }
}

test();
