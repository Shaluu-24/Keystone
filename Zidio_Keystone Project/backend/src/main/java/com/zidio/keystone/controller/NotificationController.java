package com.zidio.keystone.controller;

import com.zidio.keystone.domain.Notification;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.repository.NotificationRepository;
import com.zidio.keystone.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<Notification> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId(),
                PageRequest.of(page, size)
        );
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot update this notification");
        }

        notification.setRead(true);

        return notificationRepository.save(notification);
    }
}