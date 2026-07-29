package com.zidio.keystone.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(@NotBlank String name, String contactEmail) {}
