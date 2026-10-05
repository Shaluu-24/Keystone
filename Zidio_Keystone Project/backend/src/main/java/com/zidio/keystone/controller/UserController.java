package com.zidio.keystone.controller;

import com.zidio.keystone.domain.Role;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.repository.UserRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public List<User> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN);
    }
}