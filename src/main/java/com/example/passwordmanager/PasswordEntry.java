package com.example.passwordmanager;

import java.time.Instant;

public class PasswordEntry {
    private String id; // simple unique id
    private String site;
    private String username;
    private String ciphertext; // base64
    private String salt; // base64
    private String iv; // base64
    private long createdAt;

    public PasswordEntry() {}
    public PasswordEntry(String id, String site, String username, String ciphertext, String salt, String iv) {
        this.id = id;
        this.site = site;
        this.username = username;
        this.ciphertext = ciphertext;
        this.salt = salt;
        this.iv = iv;
        this.createdAt = Instant.now().toEpochMilli();
    }
    // getters + setters
    // ... (omitted here for brevity — include standard getters/setters)
    // generate standard getters and setters or use Lombok in real project
    public String getId(){return id;}
    public void setId(String id){this.id=id;}
    public String getSite(){return site;}
    public void setSite(String site){this.site=site;}
    public String getUsername(){return username;}
    public void setUsername(String username){this.username=username;}
    public String getCiphertext(){return ciphertext;}
    public void setCiphertext(String ciphertext){this.ciphertext=ciphertext;}
    public String getSalt(){return salt;}
    public void setSalt(String salt){this.salt=salt;}
    public String getIv(){return iv;}
    public void setIv(String iv){this.iv=iv;}
    public long getCreatedAt(){return createdAt;}
    public void setCreatedAt(long createdAt){this.createdAt=createdAt;}
}
