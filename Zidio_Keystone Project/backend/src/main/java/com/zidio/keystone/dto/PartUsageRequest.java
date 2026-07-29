package com.zidio.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PartUsageRequest(@NotNull Long partId, @Min(1) int qtyUsed) {}
