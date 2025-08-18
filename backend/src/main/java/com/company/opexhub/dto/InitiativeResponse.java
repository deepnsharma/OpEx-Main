package com.company.opexhub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InitiativeResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private BigDecimal expectedSavings;
    private BigDecimal actualSavings;
    private String site;
    private String discipline;
    private String category;
    private String initiativeNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progressPercentage;
    private Integer currentStage;
    private Boolean requiresMoc;
    private Boolean requiresCapex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private String createdByEmail;

    // Constructors
    public InitiativeResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public BigDecimal getExpectedSavings() { return expectedSavings; }
    public void setExpectedSavings(BigDecimal expectedSavings) { this.expectedSavings = expectedSavings; }

    public BigDecimal getActualSavings() { return actualSavings; }
    public void setActualSavings(BigDecimal actualSavings) { this.actualSavings = actualSavings; }

    public String getSite() { return site; }
    public void setSite(String site) { this.site = site; }

    public String getDiscipline() { return discipline; }
    public void setDiscipline(String discipline) { this.discipline = discipline; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getInitiativeNumber() { return initiativeNumber; }
    public void setInitiativeNumber(String initiativeNumber) { this.initiativeNumber = initiativeNumber; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public Integer getCurrentStage() { return currentStage; }
    public void setCurrentStage(Integer currentStage) { this.currentStage = currentStage; }

    public Boolean getRequiresMoc() { return requiresMoc; }
    public void setRequiresMoc(Boolean requiresMoc) { this.requiresMoc = requiresMoc; }

    public Boolean getRequiresCapex() { return requiresCapex; }
    public void setRequiresCapex(Boolean requiresCapex) { this.requiresCapex = requiresCapex; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
}