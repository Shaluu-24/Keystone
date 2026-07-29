package com.zidio.keystone.dto;

public record LoginResponse(
        String token,
        String email,
        String name,
        String role
) {}
