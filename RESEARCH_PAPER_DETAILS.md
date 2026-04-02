# CipherTalk: Comprehensive Project Documentation & Research Paper Details

This document provides an exhaustive, in-depth overview of the **CipherTalk** project. It is intended to serve as the definitive source of truth for all technical implementations, architectural decisions, and cryptographic schemes used in the application. This file contains all necessary details required to draft academic research papers, conference papers, or technical case studies without needing external references.

---

## 1. Abstract / Executive Summary
**CipherTalk** is a highly secure, real-time communication platform designed strictly around the **Zero-Knowledge** architecture and End-to-End Encryption (E2EE). Traditional Web-based E2EE applications either suffer from complex state management issues (e.g., Double Ratchet sync failures) or compromise on encryption boundaries when introducing features like cross-device reading or multimedia sharing. CipherTalk actively addresses this by proposing a novel, stateless session-key exchange mechanism encapsulated in an RSA envelope, wrapped around a distinctive **Dual-Layer Symmetric Encryption (AES-256 + TripleDES)** cascade. The resulting system effectively prioritizes extreme data compartmentalization, defense-in-depth security, and high performance via native WebCrypto hardware acceleration.

---

## 2. Technology Stack Overview

The application utilizes a modernized **MERN** stack integrated with WebSockets, operating completely asynchronously for real-time capabilities.

### 2.1 Backend (Server)
- **Runtime:** Node.js (v18+) with Express.js backend framework.
- **Database:** MongoDB (utilizing Mongoose ODM) for persistent, agnostic data storage.
- **Real-Time Communication:** Socket.io for instantaneous message delivery and status synchronization.
- **Authentication:** JSON Web Tokens (JWT) for secure REST API endpoint protection and bcryptjs for password hashing.
- **Media Management:** Cloudinary API for storing encrypted multimedia payloads as raw base64.

### 2.2 Frontend (Client)
- **Framework:** React 19 (managed via Vite) for a highly responsive, component-based UI.
- **Styling:** TailwindCSS with Framer Motion for rapid, aesthetic, and dynamic micro-animations.
- **State Management:** React Hooks and Contexts, interfacing via `axios` for HTTP and `socket.io-client` for persistent WebSocket connections.
- **Cryptography Libraries:** Native WebCrypto API (`window.crypto.subtle`) mapped alongside `node-forge` & `crypto-js`.

---

## 3. Core Architectural Principles
**Zero-Knowledge Backend:** The CipherTalk backend operates under strict zero-knowledge constraints. The server database only receives encrypted blobs, digital signatures, hashed integrities, and encrypted symmetric keys. Assuming complete database compromise, no single plaintext string can be parsed without possessing the specific user's client-side RSA private key.

**Stateless Sender-Retained History:** Traditional E2E protocols struggle with allowing senders to natively see their own outbound messages across multiple sessions without heavily complicating synchronous states. CipherTalk solves this organically by creating standard dual-destined locks (`encryptedSessionKey` for receiver, and `senderEncryptedSessionKey` for sender) for every message payload.

---

## 4. Cryptographic Model & Innovations

The cryptography within CipherTalk is arguably its most distinct engineering feature. It utilizes a multi-tiered hybrid model (Asymmetric + Symmetric + Hashing).

### 4.1 Key Generation and Storage (Asymmetric)
- **Algorithm:** RSA-OAEP paired with 2048-bit key strength.
- **Execution:** Operations heavily prefer the asynchronous, hardware-accelerated **WebCrypto API**. When legacy compatibility demands it, the application gracefully poly-fills using programmatic fallbacks via `node-forge`.
- **Storage Policy:** Upon registration, the public key is broadcast to the server, while the Private Key is formatted to PEM, stringified, and permanently strictly isolated to `localStorage` on the client's browser. It is mathematically impossible for the server to acquire this key.

### 4.2 Ephemeral Session Key Generation
Instead of a progressive Diffie-Hellman Ratchet which requires complex state memory, CipherTalk utilizes a per-message ephemeral stateless approach.
- For every message sent, the client locally generates a **256-bit (32-byte) pseudo-random Buffer** (Session Key) using secure entropy.

### 4.3 Novel Double-Layer Symmetric Cascade (Defense-in-Depth)
Symmetric encryption handles the massive payload volume (text vs image vs file). CipherTalk utilizes a highly irregular and distinct dual-layer approach:
- **Layer 1 (Inner Envelope):** The plaintext is first encrypted using AES (Advanced Encryption Standard, 256-bit).
- **Layer 2 (Outer Envelope):** The AES output ciphertext is subsequently fed as plaintext into a TripleDES (Data Encryption Standard) layer using the identical session key.

*Academic Justification:* While AES is the industry standard (NIST), any future theoretical vulnerability discovered in AES mathematics alone will not immediately compromise pastCipherTalk databases, as the attacker must simultaneously break TripleDES. This forces attackers to solve two entirely different mathematical complexities concurrently.

### 4.4 Session Key Wrapping (Key Exchange)
The plaintext Session Key (used for AES+3DES) must be transmitted to the recipient securely.
- It is asymmetrically encrypted twice prior to transmission:
   1. Using the **Recipient's Public RSA Key** (stored as `encryptedSessionKey`).
   2. Using the **Sender's Public RSA Key** (stored as `senderEncryptedSessionKey`) to ensure the sender can view sent history locally.

### 4.5 Digital Signatures and Non-Repudiation
How does the recipient know the server didn't inject data?
- **Hashing:** The plaintext message combined with the Sender ID is hashed utilizing the **SHA-256** standard algorithm.
- **Signature:** The sender uses their hidden RSA Private Key to digitally sign this SHA-256 hash. 
- **Validation:** When the recipient attempts decryption, they extract the hash, verify the signature using the Sender's public key (fetched from the database), and re-hash the decrypted message to ensure the strings match linearly. If modified mid-transit, validation instantly fails.

---

## 5. Detailed Network Flow (The Lifecycle of a Message)

1. **User Types Message:** The user types plaintext in the UI and clicks send.
2. **Key Generation:** A completely random 32-byte session key is born locally.
3. **Double Encryption Execution:** The client's CPU computes Layer 1 (AES-256) on the plaintext, followed directly by Layer 2 (TripleDES) on the ciphertext.
4. **Integrity Packaging:** The client executes SHA-256 on the original message and produces an RSA Signature from it.
5. **Key Encapsulation:** The raw session key is encrypted with the Recipient's public key, and again with the Sender's public key.
6. **Transmission:** A JSON blob is structured containing purely cryptographic parameters (no plaintext) and pushed to the HTTP API.
7. **Server Intake & Socket Broadcast:** The Message Controller saves the document to MongoDB. Concurrently, it checks the `userSocketMap`. If the recipient is actively connected, a `newMessage` event fires, pushing the real-time blob payload down the Socket.io WebSocket pipe.
8. **Client Decryption (Recipient):** Upon WebSocket ingestion (or HTTP fetch for history), the recipient extracts `encryptedSessionKey`. Using their locked local RSA Private Key, they securely unwrap the AES Session key.
9. **Dual Decryption Layer:** They use the session key to decrypt the TripleDES exterior, followed by decrypting the AES interior.
10. **Validation:** They hash the results, run Signature Verification against the Sender's public key, and render logic on the DOM.

---

## 6. Real-World Limitations & Future Work

No system is impenetrable. In a conference paper, citing system limitations proves scientific rigor:

1. **Key Compromise Isolation limits:** Because CipherTalk leans towards a generated AES Session Key enveloped per message rather than strict Double Ratchet Forward Secrecy, if a user's *Private Key* is extracted from local storage by physical malware, an attacker who *also* possesses historical intercepted database payloads could retroactively decrypt past chat history. Future iterations may explore modifying the session generator into a hybrid hash-chained ratchet to guarantee Forward Secrecy while maintaining stateless server architecture.
2. **Metadata Transparency:** While payloads are zero-knowledge, the MongoDB still maps `senderId` and `receiverId`. Traffic analysis (who talks to whom and when) remains theoretically discernible by the server administrator. Future updates could implement onion routing, matrix federations, or blinded signatures for metadata obfuscation.
3. **TripleDES Deprecation Computation:** While the cascade provides mathematical diversity, TripleDES carries relatively heavy computation penalty natively in JS runtime compared to AES-GCM. 

---

## 7. Comparison with Existing State-of-the-Art (Signal Protocol & WhatsApp)

When writing a conference paper, this comparison is your strongest selling point:

| Feature | WhatsApp / Signal | CipherTalk |
| :--- | :--- | :--- |
| **P2P Symmetry** | AES-GCM/ChaCha20 | **AES-256 + TripleDES Cascade** |
| **History Sync** | Difficult, requires device-to-device tunneling | **Native `senderEncryptedSessionKey`** |
| **Metadata Defense** | Exposes sender relationships and timestamps | Exposes sender relationships and timestamps |
| **Forward Secrecy** | Perfect / Double Ratchet | Message Level Isolation |
| **Cryptography Location** | Native Application OS Libraries | Native WebCrypto Browser Pipeline & Node-Forge Polyfill |
| **Browser Compatibility** | Primarily app bound, web is a connected mirror | Built entirely for pure web, completely self-sufficient in-browser |

---

## 8. Conclusion
CipherTalk successfully demonstrates that heavily redundant, high-level encryption systems traditionally reserved for desktop applications can be fluidly mapped to web environments. By engineering a hybrid AES-3DES symmetry, protected by pure RSA Key enveloping, it eliminates the rigid state management overhead seen in Ratchet systems and facilitates dynamic cross-retrieval (Sender History retention) without compromising End-to-End security. The execution of this software proves web protocols paired correctly with WebSockets and native WebCrypto can deliver uncompromised security.
