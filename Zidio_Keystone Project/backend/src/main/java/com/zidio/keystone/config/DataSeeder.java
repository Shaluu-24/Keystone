package com.zidio.keystone.config;

import com.zidio.keystone.domain.Customer;
import com.zidio.keystone.domain.Role;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.repository.CustomerRepository;
import com.zidio.keystone.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds one demo login per role, using the real BCryptPasswordEncoder rather than a
 * hard-coded hash in a migration. Runs once on startup; skips anything that already exists.
 *
 * Demo credentials (also listed in README, required for submission per brief section 15):
 *   dispatcher@keystone.demo / Password123!
 *   technician@keystone.demo / Password123!
 *   manager@keystone.demo    / Password123!
 *   customer@keystone.demo   / Password123!
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Customer meridian = customerRepository.findByName("Meridian Facilities Management").orElse(null);

        seedUser("Dana Dispatcher", "dispatcher@keystone.demo", Role.DISPATCHER, null);
        seedUser("Tara Technician", "technician@keystone.demo", Role.TECHNICIAN, null);
        seedUser("Mike Manager", "manager@keystone.demo", Role.MANAGER, null);
        seedUser("Cara Customer", "customer@keystone.demo", Role.CUSTOMER, meridian);
    }

    private void seedUser(String name, String email, Role role, Customer customer) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role(role)
                .customer(customer)
                .build();
        userRepository.save(user);
    }
}
