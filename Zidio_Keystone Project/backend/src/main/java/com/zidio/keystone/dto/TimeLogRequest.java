package com.zidio.keystone.dto;

import jakarta.validation.constraints.Min;

public record TimeLogRequest(@Min(1) int minutes, String note) {}
