package com.zidio.keystone.controller;

import com.zidio.keystone.domain.Part;
import com.zidio.keystone.exception.ApiExceptions.NotFoundException;
import com.zidio.keystone.repository.PartRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartRepository partRepository;

    public PartController(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public record PartRequest(@NotBlank String name, @NotBlank String sku,
                               @NotNull BigDecimal unitCost, @NotNull Integer stockQty) {}

    @GetMapping
    public List<Part> list() {
        return partRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public Part create(@Valid @RequestBody PartRequest request) {
        Part part = Part.builder()
                .name(request.name()).sku(request.sku())
                .unitCost(request.unitCost()).stockQty(request.stockQty())
                .build();
        return partRepository.save(part);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public Part update(@PathVariable Long id, @Valid @RequestBody PartRequest request) {
        Part part = partRepository.findById(id).orElseThrow(() -> new NotFoundException("Part not found: " + id));
        part.setName(request.name());
        part.setSku(request.sku());
        part.setUnitCost(request.unitCost());
        part.setStockQty(request.stockQty());
        return partRepository.save(part);
    }
}
