package com.company.opexhub.config;

import com.company.opexhub.entity.User;
import com.company.opexhub.entity.Initiative;
import com.company.opexhub.entity.WorkflowStage;
import com.company.opexhub.entity.WfMaster;
import com.company.opexhub.repository.UserRepository;
import com.company.opexhub.repository.InitiativeRepository;
import com.company.opexhub.repository.WorkflowStageRepository;
import com.company.opexhub.repository.WfMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private WfMasterRepository wfMasterRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist
        if (userRepository.count() == 0) {
            initializeUsers();
        }
        
        // Check if workflow stages need to be initialized for existing initiatives
        initializeWorkflowStages();
        
        // Initialize workflow master data
        initializeWfMaster();
    }

    private void initializeUsers() {
        // Create 11 users for 11 workflow stages based on correct role sequence - All users assigned to NDS site
        User[] demoUsers = {
            // Stage 1: Register Initiative - STLD (Site TSD Lead) - Can CREATE initiatives
            new User("Manoj Tiwari", "manoj.tiwari@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "TSD", "STLD", "Site TSD Lead"),
            
            // Stage 2: Approval - SH (Site Head)
            new User("Priya Sharma", "priya.sharma@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MGMT", "SH", "Site Head"),
            
            // Stage 3: Define Responsibilities - EH (Engineering Head)
            new User("Amit Patel", "amit.patel@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "ENG", "EH", "Engineering Head"),
            
            // Stage 4: MOC Stage - IL (Initiative Lead)
            new User("Rajesh Kumar", "rajesh.kumar@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MECH", "IL", "Initiative Lead"),
            
            // Stage 5: CAPEX Stage - IL (Initiative Lead) - Same as Stage 4 (Rajesh Kumar)
            // Removed - using single IL for stages 4,5,6 as per WfMaster configuration
            
            // Stage 6: Initiative Timeline Tracker - IL (Initiative Lead) - Same as Stage 4 (Rajesh Kumar)  
            // Removed - using single IL for stages 4,5,6 as per WfMaster configuration
            
            // Stage 7: Trial Implementation - STLD (Site TSD Lead)
            new User("Vikram Gupta", "vikram.gupta@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "MAINT", "STLD", "Site TSD Lead"),
            
            // Stage 8: Periodic Status Review - CTSD (Corporate TSD)
            new User("Kavya Nair", "kavya.nair@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "CORP", "CTSD", "Corporate TSD"),
            
            // Stage 9: Savings Monitoring - STLD (Site TSD Lead)
            new User("Suresh Reddy", "suresh.reddy@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "EG", "STLD", "Site TSD Lead"),
            
            // Stage 10: Savings Validation - STLD (Site TSD Lead)
            new User("Rohit Jain", "rohit.jain@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "SF", "STLD", "Site TSD Lead"),
            
            // Stage 11: Initiative Closure - STLD (Site TSD Lead)
            new User("Ananya Verma", "ananya.verma@godeepak.com", 
                    passwordEncoder.encode("password123"), "NDS", "QA", "STLD", "Site TSD Lead")
        };

        for (User user : demoUsers) {
            userRepository.save(user);
        }

        System.out.println("Demo users initialized successfully!");
        System.out.println("=== LOGIN CREDENTIALS (All NDS Site Users) ===");
        System.out.println("Email: manoj.tiwari@godeepak.com | Password: password123 | Role: STLD - Site TSD Lead (Stage 1 - CREATE INITIATIVES)");
        System.out.println("Email: priya.sharma@godeepak.com | Password: password123 | Role: SH - Site Head (Stage 2)");
        System.out.println("Email: amit.patel@godeepak.com | Password: password123 | Role: EH - Engineering Head (Stage 3)");
        System.out.println("Email: rajesh.kumar@godeepak.com | Password: password123 | Role: IL - Initiative Lead (Stage 4)");
        System.out.println("Email: deepika.singh@godeepak.com | Password: password123 | Role: IL - Initiative Lead (Stage 5)");
        System.out.println("Email: neha.agarwal@godeepak.com | Password: password123 | Role: IL - Initiative Lead (Stage 6)");
        System.out.println("Email: vikram.gupta@godeepak.com | Password: password123 | Role: STLD - Site TSD Lead (Stage 7)");
        System.out.println("Email: kavya.nair@godeepak.com | Password: password123 | Role: CTSD - Corporate TSD (Stage 8)");
        System.out.println("Email: suresh.reddy@godeepak.com | Password: password123 | Role: STLD - Site TSD Lead (Stage 9)");
        System.out.println("Email: rohit.jain@godeepak.com | Password: password123 | Role: STLD - Site TSD Lead (Stage 10)");
        System.out.println("Email: ananya.verma@godeepak.com | Password: password123 | Role: STLD - Site TSD Lead (Stage 11)");
        System.out.println("========================");
    }

    private void initializeWorkflowStages() {
        // Workflow stage definitions with proper names and roles (11 stages)
        String[][] stageDefinitions = {
            {"1", "Register Initiative", "STLD"},
            {"2", "Approval", "SH"},
            {"3", "Define Responsibilities", "EH"},
            {"4", "MOC Stage", "IL"},
            {"5", "CAPEX Stage", "IL"},
            {"6", "Initiative Timeline Tracker", "IL"},
            {"7", "Trial Implementation & Performance Check", "STLD"},
            {"8", "Periodic Status Review with CMO", "CTSD"},
            {"9", "Savings Monitoring (1 Month)", "STLD"},
            {"10", "Saving Validation with F&A", "STLD"},
            {"11", "Initiative Closure", "STLD"}
        };

        // WorkflowStage is now a master table - no need to create stages per initiative
        // The WorkflowStageService will initialize the master stages automatically
    }

    private void initializeWfMaster() {
        // Check if wf_master data already exists
        if (wfMasterRepository.count() == 0) {
            // Initialize WF Master data for NDS site with correct stage assignments
            // IL stages (4,5,6) are dynamic and will be created when EH selects Initiative Lead
            String[][] wfMasterData = {
                {"1", "Register Initiative", "STLD", "manoj.tiwari@godeepak.com"},
                {"2", "Site Head Approval", "SH", "priya.sharma@godeepak.com"},
                {"3", "Engineering Head Approval", "EH", "amit.patel@godeepak.com"},
                // IL stages removed - they will be created dynamically after Stage 3
                {"7", "Trial Implementation & Performance Check", "STLD", "vikram.gupta@godeepak.com"},
                {"8", "Periodic Status Review with CMO", "CTSD", "kavya.nair@godeepak.com"},
                {"9", "Savings Monitoring (1 Month)", "STLD", "suresh.reddy@godeepak.com"},
                {"10", "Saving Validation with F&A", "STLD", "rohit.jain@godeepak.com"},
                {"11", "Initiative Closure", "STLD", "ananya.verma@godeepak.com"}
            };

            for (String[] data : wfMasterData) {
                WfMaster wfMaster = new WfMaster(
                    Integer.parseInt(data[0]), // stageNumber
                    data[1], // stageName
                    data[2], // roleCode
                    "NDS", // site
                    data[3]  // userEmail
                );
                wfMasterRepository.save(wfMaster);
            }

            System.out.println("WF Master data initialized successfully for NDS site!");
        }
    }
}