package com.mentalhealth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

/**
 * AES-256-CBC encryption service.
 *
 * Used for REVERSIBLE password storage (so we can email it back to the user
 * if they forget it). The symmetric key is derived from a secret configured
 * in application.properties via PBKDF2.
 *
 * Format of the stored ciphertext: Base64( IV(16 bytes) || Ciphertext )
 *
 * HOW IT WORKS:
 *  Encrypt:  plaintext  → AES-256-CBC with random IV → Base64 string (stored in DB)
 *  Decrypt:  Base64 string → split IV + ciphertext → AES-256-CBC decrypt → plaintext
 */
@Slf4j
@Service
public class EncryptionService {

    private static final String ALGORITHM      = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM  = "AES";
    private static final String KDF_ALGORITHM  = "PBKDF2WithHmacSHA256";
    private static final int    IV_LENGTH      = 16;   // 128-bit IV
    private static final int    KEY_LENGTH     = 256;  // 256-bit key
    private static final int    KDF_ITERATIONS = 65536;

    /** Fixed salt – change this value (and re-encrypt all records) if you rotate keys */
    private static final byte[] SALT = "MentalHealthSalt".getBytes(StandardCharsets.UTF_8);

    @Value("${app.encryption.secret-key:DefaultSecretKey@2025!MentalHealth}")
    private String secretKey;

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Encrypts plaintext using AES-256-CBC.
     * @param plaintext the raw password to encrypt
     * @return Base64-encoded string: IV || Ciphertext
     */
    public String encrypt(String plaintext) {
        try {
            SecretKey key = deriveKey(secretKey);

            // Generate a fresh random IV for every encryption
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext so we can recover it during decryption
            byte[] combined = new byte[IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, IV_LENGTH);
            System.arraycopy(encrypted, 0, combined, IV_LENGTH, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);

        } catch (Exception e) {
            log.error("Encryption failed: {}", e.getMessage());
            throw new RuntimeException("Failed to encrypt data. Please contact support.");
        }
    }

    /**
     * Decrypts a Base64-encoded AES-256-CBC ciphertext produced by {@link #encrypt}.
     * @param ciphertext Base64 string: IV || Ciphertext
     * @return original plaintext
     */
    public String decrypt(String ciphertext) {
        try {
            byte[] combined = Base64.getDecoder().decode(ciphertext);

            // Split IV and actual ciphertext
            byte[] iv        = new byte[IV_LENGTH];
            byte[] encrypted = new byte[combined.length - IV_LENGTH];
            System.arraycopy(combined, 0,         iv,        0, IV_LENGTH);
            System.arraycopy(combined, IV_LENGTH,  encrypted, 0, encrypted.length);

            SecretKey key     = deriveKey(secretKey);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
            byte[] decrypted = cipher.doFinal(encrypted);

            return new String(decrypted, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Decryption failed: {}", e.getMessage());
            throw new RuntimeException("Failed to decrypt data. Please contact support.");
        }
    }

    // ─── Key derivation ───────────────────────────────────────────────────────

    /**
     * Derives a 256-bit AES key from the application secret using PBKDF2.
     * This ensures the raw secret string is never used directly as a key.
     */
    private SecretKey deriveKey(String secret) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance(KDF_ALGORITHM);
        KeySpec spec = new PBEKeySpec(
                secret.toCharArray(),
                SALT,
                KDF_ITERATIONS,
                KEY_LENGTH
        );
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return new SecretKeySpec(keyBytes, KEY_ALGORITHM);
    }
}
