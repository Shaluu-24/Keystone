
package com.zidio.keystone.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * The notification API already knows the current logged-in user.
     *
     * We do not need to send the complete User entity in the
     * notification JSON response.
     *
     * @JsonIgnore prevents:
     *
     * Notification -> User -> Customer -> Sites
     *
     * from causing recursive serialization or lazy-loading errors.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /*
     * A notification may or may not belong to a Work Order.
     *
     * Service Request notifications have workOrder = null.
     *
     * We do not need to serialize the complete WorkOrder here.
     *
     * @JsonIgnore prevents:
     *
     * Notification -> WorkOrder -> StatusHistory -> User
     *
     * from causing LazyInitializationException during JSON serialization.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}

