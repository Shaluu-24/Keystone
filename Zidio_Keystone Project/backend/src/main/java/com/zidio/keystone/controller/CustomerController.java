package com.zidio.keystone.controller;

import com.zidio.keystone.domain.Customer;
import com.zidio.keystone.domain.Site;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.dto.CustomerRequest;
import com.zidio.keystone.dto.SiteRequest;
import com.zidio.keystone.exception.ApiExceptions.ForbiddenException;
import com.zidio.keystone.exception.ApiExceptions.NotFoundException;
import com.zidio.keystone.repository.CustomerRepository;
import com.zidio.keystone.repository.SiteRepository;
import com.zidio.keystone.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;

    public CustomerController(CustomerRepository customerRepository, SiteRepository siteRepository) {
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public Page<Customer> list(@RequestParam(required = false, defaultValue = "") String search, Pageable pageable) {
        return customerRepository.findByNameContainingIgnoreCase(search, pageable);
    }

    @GetMapping("/{id}")
    public Customer get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        assertCanSee(principal.getUser(), id);
        return customerRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer not found: " + id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public Customer create(@Valid @RequestBody CustomerRequest request) {
        Customer customer = Customer.builder().name(request.name()).contactEmail(request.contactEmail()).build();
        return customerRepository.save(customer);
    }

    @GetMapping("/{customerId}/sites")
    public List<Site> listSites(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long customerId) {
        assertCanSee(principal.getUser(), customerId);
        return siteRepository.findByCustomerId(customerId);
    }

    @PostMapping("/{customerId}/sites")
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public Site createSite(@PathVariable Long customerId, @Valid @RequestBody SiteRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));
        Site site = Site.builder().customer(customer).name(request.name()).address(request.address()).build();
        return siteRepository.save(site);
    }

    // A CUSTOMER-role user may only see their own organisation's record — enforced here,
    // not just left to the UI to hide the "other customers" list.
    private void assertCanSee(User actor, Long customerId) {
        if (actor.getRole() == com.zidio.keystone.domain.Role.CUSTOMER
                && (actor.getCustomer() == null || !actor.getCustomer().getId().equals(customerId))) {
            throw new ForbiddenException("You do not have access to this customer's data");
        }
    }
}
