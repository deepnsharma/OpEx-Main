package com.company.opexhub.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class InitiativeRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    private String description;

    @NotBlank
    private String priority;

    @NotNull
    private BigDecimal expectedSavings;

    @NotBlank
    private String site;

    @NotBlank
    private String discipline;

    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean requiresMoc = false;
    private Boolean requiresCapex = false;

    // Constructors
    public InitiativeRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public BigDecimal getExpectedSavings() { return expectedSavings; }
    public void setExpectedSavings(BigDecimal expectedSavings) { this.expectedSavings = expectedSavings; }

    public String getSite() { return site; }
    public void setSite(String site) { this.site = site; }

    public String getDiscipline() { return discipline; }
    public void setDiscipline(String discipline) { this.discipline = discipline; }


    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getRequiresMoc() { return requiresMoc; }
    public void setRequiresMoc(Boolean requiresMoc) { this.requiresMoc = requiresMoc; }

    public Boolean getRequiresCapex() { return requiresCapex; }
    public void setRequiresCapex(Boolean requiresCapex) { this.requiresCapex = requiresCapex; }
}