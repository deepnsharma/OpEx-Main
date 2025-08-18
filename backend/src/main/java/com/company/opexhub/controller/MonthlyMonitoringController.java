package com.company.opexhub.controller;

import com.company.opexhub.dto.ApiResponse;
import com.company.opexhub.entity.MonthlyMonitoringEntry;
import com.company.opexhub.service.MonthlyMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/monthly-monitoring")

public class MonthlyMonitoringController {

    @Autowired
    private MonthlyMonitoringService monthlyMonitoringService;

    @GetMapping("/{initiativeId}")
    public ResponseEntity<ApiResponse<List<MonthlyMonitoringEntry>>> getMonitoringEntries(@PathVariable Long initiativeId) {
        try {
            List<MonthlyMonitoringEntry> entries = monthlyMonitoringService.getMonitoringEntriesByInitiative(initiativeId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entries retrieved successfully", entries));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error retrieving monitoring entries: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{initiativeId}/month/{monthYear}")
    public ResponseEntity<ApiResponse<List<MonthlyMonitoringEntry>>> getMonitoringEntriesByMonth(
            @PathVariable Long initiativeId,
            @PathVariable String monthYear) {
        try {
            YearMonth month = YearMonth.parse(monthYear, DateTimeFormatter.ofPattern("yyyy-MM"));
            List<MonthlyMonitoringEntry> entries = monthlyMonitoringService.getMonitoringEntriesByInitiativeAndMonth(initiativeId, month);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entries retrieved successfully", entries));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error retrieving monitoring entries: " + e.getMessage(), null));
        }
    }

    @GetMapping("/entry/{id}")
    public ResponseEntity<ApiResponse<MonthlyMonitoringEntry>> getMonitoringEntryById(@PathVariable Long id) {
        try {
            Optional<MonthlyMonitoringEntry> entry = monthlyMonitoringService.getMonitoringEntryById(id);
            if (entry.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entry retrieved successfully", entry.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error retrieving monitoring entry: " + e.getMessage(), null));
        }
    }

    @PostMapping("/{initiativeId}")
    public ResponseEntity<ApiResponse<MonthlyMonitoringEntry>> createMonitoringEntry(
            @PathVariable Long initiativeId,
            @RequestBody MonthlyMonitoringEntry monitoringEntry) {
        try {
            MonthlyMonitoringEntry createdEntry = monthlyMonitoringService.createMonitoringEntry(initiativeId, monitoringEntry);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entry created successfully", createdEntry));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error creating monitoring entry: " + e.getMessage(), null));
        }
    }

    @PutMapping("/entry/{id}")
    public ResponseEntity<ApiResponse<MonthlyMonitoringEntry>> updateMonitoringEntry(
            @PathVariable Long id,
            @RequestBody MonthlyMonitoringEntry monitoringEntry) {
        try {
            MonthlyMonitoringEntry updatedEntry = monthlyMonitoringService.updateMonitoringEntry(id, monitoringEntry);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entry updated successfully", updatedEntry));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error updating monitoring entry: " + e.getMessage(), null));
        }
    }

    @PutMapping("/entry/{id}/finalize")
    public ResponseEntity<ApiResponse<MonthlyMonitoringEntry>> updateFinalizationStatus(
            @PathVariable Long id,
            @RequestParam Boolean isFinalized) {
        try {
            MonthlyMonitoringEntry updatedEntry = monthlyMonitoringService.updateFinalizationStatus(id, isFinalized);
            return ResponseEntity.ok(new ApiResponse<>(true, "Finalization status updated successfully", updatedEntry));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error updating finalization status: " + e.getMessage(), null));
        }
    }

    @PutMapping("/entry/{id}/fa-approval")
    public ResponseEntity<ApiResponse<MonthlyMonitoringEntry>> updateFAApproval(
            @PathVariable Long id,
            @RequestParam Boolean faApproval,
            @RequestParam(required = false) String faComments) {
        try {
            MonthlyMonitoringEntry updatedEntry = monthlyMonitoringService.updateFAApproval(id, faApproval, faComments);
            return ResponseEntity.ok(new ApiResponse<>(true, "F&A approval updated successfully", updatedEntry));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error updating F&A approval: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/entry/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMonitoringEntry(@PathVariable Long id) {
        try {
            monthlyMonitoringService.deleteMonitoringEntry(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monitoring entry deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error deleting monitoring entry: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{initiativeId}/pending-fa-approvals")
    public ResponseEntity<ApiResponse<List<MonthlyMonitoringEntry>>> getPendingFAApprovals(@PathVariable Long initiativeId) {
        try {
            List<MonthlyMonitoringEntry> entries = monthlyMonitoringService.getPendingFAApprovalsForInitiative(initiativeId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Pending F&A approvals retrieved successfully", entries));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error retrieving pending F&A approvals: " + e.getMessage(), null));
        }
    }
}