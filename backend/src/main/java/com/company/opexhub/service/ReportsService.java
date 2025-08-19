package com.company.opexhub.service;

import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.MonthlyMonitoringEntry;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.MonthlyMonitoringEntryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportsService {

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private MonthlyMonitoringEntryRepository monthlyMonitoringEntryRepository;

    public ByteArrayOutputStream generateDetailedExcelReport(String site, String year) throws IOException {
        // Create workbook
        XSSFWorkbook workbook = new XSSFWorkbook();
        
        // Define months for sheets
        String[] months = {
            "Apr.25", "May.25", "June.25", "Jul.25", "Aug.25", "Sept.25",
            "Oct.25", "Nov.25", "Dec.25", "Jan.26", "Feb.26", "Mar.26"
        };
        
        // Get current date for filtering (if year is specified)
        LocalDate currentDate = LocalDate.now();
        int filterYear = year != null ? Integer.parseInt(year) : currentDate.getYear();
        
        // Get initiatives data
        List<Initiative> initiatives;
        if (site != null && !site.equals("all")) {
            initiatives = initiativeRepository.findBySite(site, null).getContent();
        } else {
            initiatives = initiativeRepository.findAll();
        }
        
        // Create each monthly sheet
        for (String month : months) {
            createMonthlySheet(workbook, month, initiatives, filterYear);
        }
        
        // Write to output stream
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream;
    }
    
    private void createMonthlySheet(XSSFWorkbook workbook, String monthName, List<Initiative> initiatives, int filterYear) {
        Sheet sheet = workbook.createSheet(monthName);
        
        // Create styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        // Set column widths
        sheet.setColumnWidth(0, 1000);  // Empty column
        sheet.setColumnWidth(1, 2500);  // Sr. No.
        sheet.setColumnWidth(2, 6000);  // Description
        sheet.setColumnWidth(3, 3000);  // Category
        sheet.setColumnWidth(4, 4000);  // Initiative No.
        sheet.setColumnWidth(5, 3000);  // Initiation Date
        sheet.setColumnWidth(6, 3500);  // Initiative Leader
        sheet.setColumnWidth(7, 3000);  // Target Date
        sheet.setColumnWidth(8, 4000);  // Modification/CAPEX Cost
        sheet.setColumnWidth(9, 3500);  // Current Status
        sheet.setColumnWidth(10, 4000); // Expected Savings
        sheet.setColumnWidth(11, 4000); // Actual Savings
        sheet.setColumnWidth(12, 4500); // Annualized Value
        sheet.setColumnWidth(13, 3000); // Remarks
        
        int rowNum = 0;
        
        // Row 1: Empty
        Row emptyRow = sheet.createRow(rowNum++);
        
        // Row 2: Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(1);
        titleCell.setCellValue("INITIATIVE TRACKER SHEET");
        titleCell.setCellStyle(titleStyle);
        
        // Row 3: Tracker updated date
        Row dateRow = sheet.createRow(rowNum++);
        Cell dateLabelCell = dateRow.createCell(1);
        dateLabelCell.setCellValue("Tracker updated on Date:");
        dateLabelCell.setCellStyle(dataStyle);
        
        // Add form reference in the corner
        Cell formRefCell = dateRow.createCell(12);
        formRefCell.setCellValue("(CRP-002/F4-01)");
        formRefCell.setCellStyle(dataStyle);
        
        // Row 4: Empty
        Row emptyRow2 = sheet.createRow(rowNum++);
        
        // Row 5: Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {
            "", "Sr. No.", "Description of Initiative", "Category", "Initiative No.", 
            "Initiation Date", "Initiative Leader", "Target Date", "Modification or CAPEX Cost", 
            "Current Status", "Expected Savings", "Actual Savings", "Annualized Value FY25-26", "Remarks"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(headers[i]);
            headerCell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        int dataRowNum = 1;
        for (Initiative initiative : initiatives) {
            Row dataRow = sheet.createRow(rowNum++);
            
            // Sr. No.
            dataRow.createCell(1).setCellValue(dataRowNum++);
            
            // Description of Initiative
            dataRow.createCell(2).setCellValue(initiative.getTitle() != null ? initiative.getTitle() : "");
            
            // Category (Discipline)
            dataRow.createCell(3).setCellValue(initiative.getDiscipline() != null ? initiative.getDiscipline() : "");
            
            // Initiative No.
            dataRow.createCell(4).setCellValue(initiative.getInitiativeNumber() != null ? initiative.getInitiativeNumber() : "");
            
            // Initiation Date
            if (initiative.getStartDate() != null) {
                dataRow.createCell(5).setCellValue(initiative.getStartDate().toString());
            }
            
            // Initiative Leader (from initiator or created by)
            String initiativeLeader = "";
            if (initiative.getInitiatorName() != null && !initiative.getInitiatorName().isEmpty()) {
                initiativeLeader = initiative.getInitiatorName();
            } else if (initiative.getCreatedBy() != null) {
                initiativeLeader = initiative.getCreatedBy().getFullName();
            }
            dataRow.createCell(6).setCellValue(initiativeLeader);
            
            // Target Date
            if (initiative.getEndDate() != null) {
                dataRow.createCell(7).setCellValue(initiative.getEndDate().toString());
            }
            
            // Modification or CAPEX Cost
            if (initiative.getEstimatedCapex() != null) {
                dataRow.createCell(8).setCellValue(initiative.getEstimatedCapex().doubleValue());
            }
            
            // Current Status
            dataRow.createCell(9).setCellValue(initiative.getStatus() != null ? initiative.getStatus() : "");
            
            // Expected Savings
            if (initiative.getExpectedSavings() != null) {
                dataRow.createCell(10).setCellValue(initiative.getExpectedSavings().doubleValue());
            }
            
            // Actual Savings
            if (initiative.getActualSavings() != null) {
                dataRow.createCell(11).setCellValue(initiative.getActualSavings().doubleValue());
            }
            
            // Annualized Value (Expected Savings if no actual savings)
            if (initiative.getActualSavings() != null) {
                dataRow.createCell(12).setCellValue(initiative.getActualSavings().doubleValue());
            } else if (initiative.getExpectedSavings() != null) {
                dataRow.createCell(12).setCellValue(initiative.getExpectedSavings().doubleValue());
            }
            
            // Remarks (Current Stage Name)
            String stageName = getStageName(initiative.getCurrentStage());
            dataRow.createCell(13).setCellValue(stageName);
            
            // Apply data style to all cells
            for (int i = 1; i < 14; i++) {
                Cell cell = dataRow.getCell(i);
                if (cell != null) {
                    cell.setCellStyle(dataStyle);
                }
            }
        }
        
        // Add empty rows to match template (minimum 10 rows total)
        while (rowNum < 11) {
            Row emptyDataRow = sheet.createRow(rowNum++);
            // Create empty cells with borders
            for (int i = 1; i < 14; i++) {
                Cell emptyCell = emptyDataRow.createCell(i);
                emptyCell.setCellValue("");
                emptyCell.setCellStyle(dataStyle);
            }
        }
    }
    
    private String getStageName(Integer stageNumber) {
        if (stageNumber == null) return "Register Initiative";
        
        switch (stageNumber) {
            case 1: return "Register Initiative";
            case 2: return "Approval";
            case 3: return "Define Responsibilities";
            case 4: return "MOC Stage";
            case 5: return "CAPEX Stage";
            case 6: return "Initiative Timeline Tracker";
            case 7: return "Trial Implementation & Performance Check";
            case 8: return "Periodic Status Review with CMO";
            case 9: return "Savings Monitoring (1 Month)";
            case 10: return "Saving Validation with F&A";
            case 11: return "Initiative Closure";
            default: return "Register Initiative";
        }
    }
    
    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        
        // Add borders
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        // Center alignment
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        // Background color (light gray)
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        return style;
    }
    
    private CellStyle createTitleStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createDataStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        
        // Add borders
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        // Left alignment for text
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }
}