# CipherTalk: Cryptography & Encryption Architecture Overview

## 1. Executive Summary
This document outlines the cryptographic implementations integrated into the CipherTalk application. The project is designed with a strong focus on privacy and end-to-end encryption (E2EE), ensuring that messages can only be read by the intended sender and receiver. The server effectively operates on a purely **Zero-Knowledge** architecture regarding message contents.

## 2. Cryptographic Techniques Employed

The application leverages a hybrid encryption model combining both asymmetric and symmetric cryptographic methods, accompanied by robust hashing and digital signatures.

### A. Key Pair Generation & Storage (Asymmetric - RSA)
- **Algorithm:** RSA-OAEP with 2048-bit key size.
- **Implementation:** Leverages native browser capabilities via the `WebCrypto API` (`window.crypto.subtle`) for high-performance and secure key generation. In environments lacking WebCrypto support, a fallback mechanism utilizing `node-forge` is implemented.
- **Storage:** Keys are exported in PEM format and secured exclusively in the user's client-side `localStorage`. Private keys are never transmitted to the server.

### B. Session Key Management
- **Method:** For every message or communication session, a completely random **256-bit (32-byte) Session Key** is generated using a secure entropy source (`forge.random.getBytesSync(32)`).
- **Exchange:** This session key is encrypted asymmetrically using the Recipient's Public RSA Key, meaning only the recipient's Private Key can decrypt the session key. A secondary encrypted session key is also stored using the Sender's Public Key, allowing the sender to view their sent messages across active sessions without compromising the architecture.

### C. Unique Double-Layer Symmetric Encryption
CipherTalk utilizes a distinctive dual-layer approach for encrypting the actual message payload, prioritizing heavy defense-in-depth security:
- **Layer 1:** The plaintext message is first encrypted using **AES-256** (Advanced Encryption Standard).
- **Layer 2:** The AES-encrypted string is subsequently encrypted again using **TripleDES** (Data Encryption Standard). 
- *Both layers utilize the generated 256-bit Session Key.*

### D. Message Authentication & Integrity
- **Integrity Validation (Hashing):** Messages are hashed using the **SHA-256** algorithm. The hash includes the message content and sender ID. Upon receipt, the recipient re-computes the hash to detect if data has been manipulated in transit.
- **Non-Repudiation (Digital Signatures):** The sender creates a digital signature based on the hashed message content using their hidden RSA Private Key. The recipient verifies this signature using the sender's known Public Key, validating the sender's exact identity and guaranteeing the message is not forged by man-in-the-middle attacks.

## 3. Database Schema & Privacy Enforcement
The Database model (`Message.js`) reflects the Zero-Knowledge principle. The MongoDB database only stores abstract cryptographic data:
- `text`: Heavily encrypted dual-layer ciphertext.
- `signature`: The RSA digital signature.
- `hash`: The SHA-256 integrity hash.
- `encryptedSessionKey`: The AES session key locked securely with the recipient's RSA public key.
- `senderEncryptedSessionKey`: The AES session key locked securely with the sender's RSA public key.
- *Bonus Feature:* Support for self-destructing volatile messages (`expiresAt`), tying heavily into privacy goals.

---

## 4. How CipherTalk Differs from Existing Systems

While standard E2E apps utilize established protocols, CipherTalk diverges and innovates in specific, secure ways:

### A. Double-Layer Symmetric Encryption
- **Standard Systems (WhatsApp, Signal):** Primarily use single-layer algorithms like AES-GCM (Galois/Counter Mode) or ChaCha20-Poly1305.
- **CipherTalk:** Incorporates a unique **AES-256 + TripleDES** double-layer cascade. While requiring slightly more compute, this defense-in-depth strategy explicitly prevents brute-force exploits in the event one particular symmetric algorithm develops theoretical weakness.

### B. Session Key Strategy vs. Double Ratchet Mechanism
- **Standard Systems:** Signal and WhatsApp rely heavily on the *Double Ratchet Algorithm*, a Diffie-Hellman (ECDH) stepping mechanism where a new set of keys is progressively derived for each message, requiring complex state management and continuous synchronous updates.
- **CipherTalk:** Abandons the complex Ratchet state for a stateless, per-message generated **AES Session Key**, wrapped heavily within an RSA envelope. This model simplifies client sync states while maintaining massive security and perfect message compartmentalization.

### C. Native WebCrypto Focus
- Many web-based chat systems struggle with cryptography speeds entirely built in JavaScript. CipherTalk strategically prioritizes the browser's native C++ hardware-accelerated **WebCrypto API**, yielding superior processing latency, but intelligently provides full `node-forge` programmatic fallbacks for legacy/environment compatibility.

### D. Sender Retained Architecture
- Traditional encryption architectures severely struggle with "multi-device" or "viewing sent history" capabilities without breaking End-to-End Encryption. CipherTalk resolves this organically by generating `senderEncryptedSessionKey`. It encrypts the payload's specific session key against the *sender's own public key* separately from the receiver, allowing the chat history to be decipherable securely by the sender entirely locally without compromising the channel.
