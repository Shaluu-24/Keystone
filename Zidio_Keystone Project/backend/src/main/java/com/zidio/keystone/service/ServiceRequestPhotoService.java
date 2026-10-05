
package com.zidio.keystone.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ServiceRequestPhotoService {

    private final Path uploadDirectory;

    public ServiceRequestPhotoService(
            @Value("${keystone.upload.directory:uploads/service-requests}")
            String uploadDirectory
    ) {
        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();
    }

    public String savePhoto(MultipartFile photo) {

        if (photo == null || photo.isEmpty()) {
            return null;
        }

        String contentType = photo.getContentType();

        if (contentType == null ||
                (!contentType.equalsIgnoreCase("image/jpeg")
                        && !contentType.equalsIgnoreCase("image/png")
                        && !contentType.equalsIgnoreCase("image/webp"))) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG, and WEBP images are allowed"
            );
        }

        if (photo.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Photo size must not exceed 5 MB"
            );
        }

        try {
            Files.createDirectories(uploadDirectory);

            String originalFilename = photo.getOriginalFilename();

            String extension = getExtension(originalFilename);

            String filename = UUID.randomUUID() + extension;

            Path target = uploadDirectory.resolve(filename)
                    .normalize();

            if (!target.getParent().equals(uploadDirectory)) {
                throw new IllegalArgumentException(
                        "Invalid photo filename"
                );
            }

            Files.copy(
                    photo.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/uploads/service-requests/" + filename;

        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Unable to save service request photo",
                    ex
            );
        }
    }

    private String getExtension(String filename) {

        if (filename == null || filename.isBlank()) {
            return ".jpg";
        }

        int lastDot = filename.lastIndexOf('.');

        if (lastDot < 0) {
            return ".jpg";
        }

        String extension = filename.substring(lastDot).toLowerCase();

        if (!extension.equals(".jpg")
                && !extension.equals(".jpeg")
                && !extension.equals(".png")
                && !extension.equals(".webp")) {

            return ".jpg";
        }

        return extension;
    }
}
