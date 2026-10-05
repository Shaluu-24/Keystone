
package com.zidio.keystone.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_email")
    private String contactEmail;

    /*
     * Sites are managed separately through the customer/site endpoints.
     *
     * @JsonIgnore prevents Jackson from serializing:
     *
     * ServiceRequest -> Customer -> sites
     *
     * This avoids LazyInitializationException when a ServiceRequest
     * is returned after the JPA session has closed.
     */
    @Builder.Default
    @JsonIgnore
    @OneToMany(
            mappedBy = "customer",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Site> sites = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
