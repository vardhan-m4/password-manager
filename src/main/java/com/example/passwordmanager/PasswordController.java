package com.example.passwordmanager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.crypto.SecretKey;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class PasswordController {

    @Autowired
    private PasswordRepository repo;

    // Add an entry
    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Map<String, String> body) throws Exception {
        // expecting: site, username, password, masterPassword
        String site = body.get("site");
        String username = body.getOrDefault("username", "");
        String plainPassword = body.get("password");
        String master = body.get("masterPassword");
        if (site==null || plainPassword==null || master==null) {
            throw new IllegalArgumentException("Missing fields");
        }

        byte[] salt = CryptoUtils.generateSalt();
        SecretKey key = CryptoUtils.deriveKey(master.toCharArray(), salt);
        byte[] iv = CryptoUtils.generateIv();
        String cipher = CryptoUtils.encrypt(plainPassword, key, iv);
        PasswordEntry entry = new PasswordEntry(UUID.randomUUID().toString(), site, username,
                cipher, CryptoUtils.encodeBase64(salt), CryptoUtils.encodeBase64(iv));
        repo.add(entry);
        Map<String,Object> r = new HashMap<>();
        r.put("status","ok");
        return r;
    }

    // List entries (no secrets)
    @GetMapping("/list")
    public List<Map<String,Object>> list() {
        return repo.findAll().stream().map(e -> {
            Map<String,Object> m = new HashMap<>();
            m.put("id", e.getId());
            m.put("site", e.getSite());
            m.put("username", e.getUsername());
            m.put("createdAt", e.getCreatedAt());
            return m;
        }).toList();
    }

    // Retrieve and decrypt a password; expects site (or id) + masterPassword
    @PostMapping("/retrieve")
    public Map<String,Object> retrieve(@RequestBody Map<String,String> body) throws Exception {
        String site = body.get("site");
        String master = body.get("masterPassword");
        if (site==null || master==null) throw new IllegalArgumentException("Missing fields");
        PasswordEntry e = repo.findBySite(site).orElse(null);
        if (e==null) {
            throw new IllegalArgumentException("No entry for site");
        }
        byte[] salt = CryptoUtils.decodeBase64(e.getSalt());
        byte[] iv = CryptoUtils.decodeBase64(e.getIv());
        SecretKey key = CryptoUtils.deriveKey(master.toCharArray(), salt);
        String plain = CryptoUtils.decrypt(e.getCiphertext(), key, iv); // may throw IllegalArgumentException for bad key
        Map<String,Object> r = new HashMap<>();
        r.put("site", e.getSite());
        r.put("username", e.getUsername());
        r.put("password", plain);
        return r;
    }
}
