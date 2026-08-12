package com.zidio.keystone.dto;

public record RegisterResponse(
        String message,
        String email,
        String name
) {}
