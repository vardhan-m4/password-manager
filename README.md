# 🔐 Password Manager — Java + AES + Spring Boot + Tailwind

A minimal, modern, secure *local password manager* built with *Java (Spring Boot), **AES-GCM encryption, **PBKDF2 key derivation, and a clean **Tailwind CSS UI*.  
All stored passwords are fully encrypted and saved *locally* in passwords.json.

---

## 🚀 Quick Run Commands

[Requirements]
- Java & Maven are Required to Successfully Run This Project

Use These Commands -
1 [ Build ] - mvn clean package -DskipTests
2 [ Run ] - mvn spring-boot:run 

Then open in your browser:

http://localhost:8080/

---
## 📦 Project Structure

passwordmanager/
│ pom.xml
│ README.md
│ passwords.json (auto-created)
│
└── src/
    └── main/
        ├── java/
        │   └── com/example/passwordmanager/
        │        ├── Application.java
        │        ├── CryptoUtils.java
        │        ├── PasswordEntry.java
        │        ├── PasswordRepository.java
        │        └── PasswordController.java
        │
        └── resources/
            └── static/
                ├── index.html
                ├── styles.css
                └── app.js


---

## 🔧 Features
- ✔ *AES-256 GCM encryption*
- ✔ *PBKDF2 password-based key derivation*
- ✔ *Local-only storage — no database needed*
- ✔ *Modern Tailwind UI with icons & animations*
- ✔ Add, retrieve, list passwords  
- ✔ Copy-to-clipboard with auto-clear  
- ✔ JSON export + basic import preview  
- ✔ Toast notifications & smooth UI feedback  
- ✔ Decrypt from list using inline buttons  

---

## 🗝 How It Works
1. You enter a *Master Password* (never stored anywhere).
2. PBKDF2 derives a unique AES-256 key per password entry.
3. Passwords are encrypted using *AES/GCM/NoPadding*.
4. Each record stores:
   - salt  
   - iv  
   - ciphertext  
   - site, username, timestamp  
5. Data is stored in passwords.json locally in the project folder.
6. Without the correct master password, *decryption fails* (GCM tag mismatch).

---

## 🖥 UI Screenshots
(You can add screenshots here once your UI is running.)

---

## 📜 API Endpoints

| Method | Endpoint        | Description                     |
|--------|------------------|---------------------------------|
| POST   | /api/add       | Encrypt & store password        |
| GET    | /api/list      | List stored entries             |
| POST   | /api/retrieve  | Decrypt password for a site     |

---

## 🔨 Build Instructions

### Build the JAR
sh
mvn clean package -DskipTests


### Run the JAR
sh
java -jar target/password-manager-0.0.1-SNAPSHOT.jar


### Optional: Change port
sh
java -jar target/password-manager-0.0.1-SNAPSHOT.jar --server.port=9090


---

## 🔒 Security Notes
- Master password *is never saved or transmitted anywhere else*.
- PBKDF2 parameters:
  - 200,000 iterations  
  - Random 16-byte salt  
- AES-GCM ensures:
  - Authenticated encryption  
  - Tamper detection  
- All data remains local on your machine.
- Losing the master password means *permanent loss of access*.

---

## 📚 Future Improvements
- Full import (write back to passwords.json)
- Delete & Edit password entries
- Client-side WebCrypto key derivation
- Dark mode toggle
- Desktop app version (JavaFX / Electron)
- Encrypted auto-backup

---

## 🤝 Contributions
Feel free to build on this project — UI, API, encryption improvements… PRs welcome!

---
## 📄 License
MIT License  
This project is intended for personal and educational use.
