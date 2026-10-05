
package com.zidio.keystone.dto;

import com.zidio.keystone.domain.Priority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServiceRequestCreateRequest(

        @NotNull
        Long siteId,

        @NotBlank
        String serviceType,

        @NotBlank
        String description,

        @NotNull
        Priority priority
) {
}
