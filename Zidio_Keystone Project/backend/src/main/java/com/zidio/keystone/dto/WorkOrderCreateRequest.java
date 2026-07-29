package com.zidio.keystone.dto;

import com.zidio.keystone.domain.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorkOrderCreateRequest(
        @NotBlank String title,
        String description,
        @NotNull Priority priority,
        @NotNull Long customerId,
        @NotNull Long siteId
) {}
