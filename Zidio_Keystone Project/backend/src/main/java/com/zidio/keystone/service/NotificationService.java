
package com.zidio.keystone.service;

import com.zidio.keystone.domain.Notification;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.domain.WorkOrder;
import com.zidio.keystone.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification create(
            User user,
            WorkOrder workOrder,
            String title,
            String message,
            String type) {

        Notification notification = Notification.builder()
                .user(user)
                .workOrder(workOrder)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional
    public void createForUsers(
            List<User> users,
            WorkOrder workOrder,
            String title,
            String message,
            String type) {

        for (User user : users) {
            create(
                    user,
                    workOrder,
                    title,
                    message,
                    type
            );
        }
    }
}
