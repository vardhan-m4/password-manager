package com.example.passwordmanager;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class PasswordRepository {
    private final ObjectMapper mapper = new ObjectMapper();
    private final File file;

    public PasswordRepository() {
        this.file = Paths.get("passwords.json").toFile();
    }

    public synchronized List<PasswordEntry> findAll() {
        try {
            if (!file.exists()) return new ArrayList<>();
            return mapper.readValue(file, new TypeReference<List<PasswordEntry>>(){});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public synchronized void saveAll(List<PasswordEntry> list) {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, list);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public synchronized void add(PasswordEntry entry) {
        List<PasswordEntry> list = findAll();
        list.add(entry);
        saveAll(list);
    }

    public synchronized Optional<PasswordEntry> findBySite(String site) {
        return findAll().stream().filter(e -> e.getSite().equalsIgnoreCase(site)).findFirst();
    }
}
