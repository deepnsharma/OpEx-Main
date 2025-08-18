package com.company.opexhub.controller;

import com.company.opexhub.dto.ApiResponse;
import com.company.opexhub.dto.InitiativeRequest;
import com.company.opexhub.dto.InitiativeResponse;
import com.company.opexhub.entity.Initiative;
import com.company.opexhub.security.UserPrincipal;
import com.company.opexhub.service.InitiativeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/initiatives")
public class InitiativeController {

    @Autowired
    private InitiativeService initiativeService;

    @GetMapping
    public Page<Initiative> getAllInitiatives(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String site,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return initiativeService.searchInitiatives(status, site, search, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Initiative> getInitiativeById(@PathVariable Long id) {
        return initiativeService.getInitiativeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInitiative(@Valid @RequestBody InitiativeRequest request,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Initiative initiative = initiativeService.createInitiative(request, currentUser.getId());
            
            // Convert to response DTO to avoid serialization issues
            InitiativeResponse response = new InitiativeResponse();
            response.setId(initiative.getId());
            response.setTitle(initiative.getTitle());
            response.setDescription(initiative.getDescription());
            response.setStatus(initiative.getStatus());
            response.setPriority(initiative.getPriority());
            response.setExpectedSavings(initiative.getExpectedSavings());
            response.setActualSavings(initiative.getActualSavings());
            response.setSite(initiative.getSite());
            response.setDiscipline(initiative.getDiscipline());
            response.setStartDate(initiative.getStartDate());
            response.setEndDate(initiative.getEndDate());
            response.setProgressPercentage(initiative.getProgressPercentage());
            response.setCurrentStage(initiative.getCurrentStage());
            response.setRequiresMoc(initiative.getRequiresMoc());
            response.setRequiresCapex(initiative.getRequiresCapex());
            response.setCreatedAt(initiative.getCreatedAt());
            response.setUpdatedAt(initiative.getUpdatedAt());
            response.setCreatedByName(initiative.getCreatedBy().getFullName());
            response.setCreatedByEmail(initiative.getCreatedBy().getEmail());
            
            return ResponseEntity.ok(new ApiResponse(true, "Initiative created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInitiative(@PathVariable Long id,
                                            @Valid @RequestBody InitiativeRequest request) {
        try {
            Initiative initiative = initiativeService.updateInitiative(id, request);
            return ResponseEntity.ok(new ApiResponse(true, "Initiative updated successfully", initiative));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInitiative(@PathVariable Long id) {
        try {
            initiativeService.deleteInitiative(id);
            return ResponseEntity.ok(new ApiResponse(true, "Initiative deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}