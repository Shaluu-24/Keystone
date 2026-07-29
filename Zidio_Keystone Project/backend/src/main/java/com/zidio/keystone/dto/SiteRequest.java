package com.zidio.keystone.dto;

import jakarta.validation.constraints.NotBlank;

public record SiteRequest(@NotBlank String name, @NotBlank String address) {}
