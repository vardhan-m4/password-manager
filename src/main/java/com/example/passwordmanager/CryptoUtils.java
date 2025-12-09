package com.example.passwordmanager;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.BadPaddingException;
import javax.crypto.AEADBadTagException; // ok to import
import java.security.SecureRandom;
import java.util.Base64;

public class CryptoUtils {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int AES_KEY_BITS = 256;
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int IV_LENGTH = 12; // bytes for GCM
    private static final int SALT_LENGTH = 16; // bytes
    private static final int ITERATIONS = 200_000;

    public static byte[] generateSalt() {
        byte[] s = new byte[SALT_LENGTH];
        RANDOM.nextBytes(s);
        return s;
    }

    public static byte[] generateIv() {
        byte[] iv = new byte[IV_LENGTH];
        RANDOM.nextBytes(iv);
        return iv;
    }

    public static SecretKey deriveKey(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, AES_KEY_BITS);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] keyBytes = skf.generateSecret(spec).getEncoded();
        return new SecretKeySpec(keyBytes, "AES");
    }

    public static String encrypt(String plain, SecretKey key, byte[] iv) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] cipherBytes = cipher.doFinal(plain.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(cipherBytes);
    }

    public static String decrypt(String base64Cipher, SecretKey key, byte[] iv) throws Exception {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);
            byte[] bytes = Base64.getDecoder().decode(base64Cipher);
            byte[] plain = cipher.doFinal(bytes);
            return new String(plain, "UTF-8");
        } catch (BadPaddingException ex) {
            // This covers AEADBadTagException as well (AEADBadTagException is a subclass of BadPaddingException)
            throw new IllegalArgumentException("Decryption failed (bad password or tampered data).");
        }
    }

    public static String encodeBase64(byte[] b) { return Base64.getEncoder().encodeToString(b); }
    public static byte[] decodeBase64(String s) { return Base64.getDecoder().decode(s); }
}
