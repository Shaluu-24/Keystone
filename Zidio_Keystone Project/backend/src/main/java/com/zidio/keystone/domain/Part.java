package com.zidio.keystone.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "unit_cost", nullable = false)
    private java.math.BigDecimal unitCost;

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty;
}
