package com.zidio.keystone.dto;

import com.zidio.keystone.domain.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull WorkOrderStatus toStatus,
        String note
) {}
