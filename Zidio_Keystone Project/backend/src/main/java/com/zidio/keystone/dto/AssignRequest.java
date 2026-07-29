package com.zidio.keystone.dto;

import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull Long technicianId, String note) {}
