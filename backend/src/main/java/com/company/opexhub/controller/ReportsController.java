package com.company.opexhub.controller;

import com.company.opexhub.service.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @GetMapping("/export/detailed-excel")
    public ResponseEntity<ByteArrayResource> exportDetailedExcel(
            @RequestParam(required = false) String site,
            @RequestParam(required = false) String year) {
        
        try {
            // Generate the Excel report
            ByteArrayOutputStream outputStream = reportsService.generateDetailedExcelReport(site, year);
            
            // Create response with proper headers
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());
            
            // Generate filename with timestamp
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String filename = String.format("Monthly_Initiative_Report_%s.xlsx", timestamp);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(resource.contentLength())
                    .body(resource);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}