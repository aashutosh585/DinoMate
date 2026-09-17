package com.job.service.impl;

import com.job.dto.aggregator.AggregatorJobDTO;
import com.job.dto.aggregator.AggregatorScrapeRequestDTO;
import com.job.dto.aggregator.AggregatorScrapeResponseDTO;
import com.job.entity.Employer;
import com.job.entity.Job;
import com.job.enums.JobType;
import com.job.enums.Role;
import com.job.enums.WorkMode;
import com.job.repository.EmployerRepository;
import com.job.repository.JobRepository;
import com.job.service.interfaces.IAggregatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AggregatorServiceImpl implements IAggregatorService {

    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${aggregator.api.url:http://localhost:3001/api/scrape}")
    private String aggregatorApiUrl;

    @Value("${aggregator.api.secret:nope}")
    private String secret;

    @Value("${aggregator.api.email:ashutoshmaurya585@gmail.com}")
    private String adminEmail;

    private RestTemplate getRestTemplate() {
        return new RestTemplateBuilder()
                .setConnectTimeout(Duration.ofSeconds(15))
                .setReadTimeout(Duration.ofSeconds(45))
                .build();
    }

    @Override
    @Transactional
    public AggregatorScrapeResponseDTO scrapeAndSync(AggregatorScrapeRequestDTO request) {
        long startTime = System.currentTimeMillis();

        // Default fallbacks according to DinoMate guide
        if (request.getKeyword() == null || request.getKeyword().isBlank()) {
            request.setKeyword("Software Engineer");
        }
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            request.setLocation("Remote");
        }
        if (request.getSources() == null || request.getSources().isEmpty()) {
            request.setSources(List.of("greenhouse", "lever", "ashby", "linkedin"));
        }
        if (request.getLimit() == null || request.getLimit() <= 0) {
            request.setLimit(30);
        }
        if (request.getDryRun() == null) {
            request.setDryRun(true);
        }
        if (request.getTriggerSource() == null || request.getTriggerSource().isBlank()) {
            request.setTriggerSource("admin");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-auto-job-secret", secret);
        headers.set("x-cron-email", adminEmail);
        headers.set("Authorization", "Bearer " + secret);

        HttpEntity<AggregatorScrapeRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            log.info("Dispatching scrape call to DinoMate API: {} for keyword='{}', location='{}', sources={}, dryRun={}",
                    aggregatorApiUrl, request.getKeyword(), request.getLocation(), request.getSources(), request.getDryRun());

            ResponseEntity<AggregatorScrapeResponseDTO> response = getRestTemplate().exchange(
                    aggregatorApiUrl,
                    HttpMethod.POST,
                    entity,
                    AggregatorScrapeResponseDTO.class
            );

            AggregatorScrapeResponseDTO responseBody = response.getBody();
            if (responseBody == null) {
                return AggregatorScrapeResponseDTO.builder()
                        .success(false)
                        .message("Empty response received from DinoMate Aggregator API.")
                        .errors(List.of("No body in response"))
                        .build();
            }

            // If dryRun is false, persist received jobs into PostgreSQL DB
            if (Boolean.FALSE.equals(request.getDryRun()) && responseBody.getJobs() != null) {
                Map<String, Object> stats = persistJobsToDatabase(responseBody.getJobs());
                responseBody.setDbStats(stats);
                responseBody.setMessage("Successfully scraped and saved " + stats.get("insertedCount") + " jobs into database.");
            } else {
                responseBody.setMessage("Retrieved " + (responseBody.getJobs() != null ? responseBody.getJobs().size() : 0) + " jobs (Dry Run / In-Memory).");
            }

            responseBody.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            return responseBody;

        } catch (ResourceAccessException e) {
            log.warn("DinoMate Aggregator service unreachable at {}: {}", aggregatorApiUrl, e.getMessage());
            return AggregatorScrapeResponseDTO.builder()
                    .success(false)
                    .keyword(request.getKeyword())
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .message("DinoMate Aggregator API at " + aggregatorApiUrl + " is currently offline or unreachable. Ensure the service is running on port 3001.")
                    .errors(List.of("Connection failed: " + e.getMessage()))
                    .jobs(Collections.emptyList())
                    .build();
        } catch (Exception e) {
            log.error("Error executing scrape request via DinoMate API", e);
            return AggregatorScrapeResponseDTO.builder()
                    .success(false)
                    .keyword(request.getKeyword())
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .message("Error during scraping: " + e.getMessage())
                    .errors(List.of(e.getMessage()))
                    .jobs(Collections.emptyList())
                    .build();
        }
    }

    private Map<String, Object> persistJobsToDatabase(List<AggregatorJobDTO> jobDTOs) {
        int inserted = 0;
        int skipped = 0;
        int failed = 0;

        for (AggregatorJobDTO dto : jobDTOs) {
            try {
                if (dto.getTitle() == null || dto.getTitle().isBlank()) {
                    skipped++;
                    continue;
                }

                String companyName = (dto.getCompany() != null && !dto.getCompany().isBlank())
                        ? dto.getCompany().trim()
                        : "Tech Company";

                // 1. Get or create Employer entity
                Employer employer = getOrCreateEmployer(companyName);

                // 2. Check for duplicate job
                boolean exists = jobRepository.existsByTitleIgnoreCaseAndEmployer(dto.getTitle().trim(), employer);
                if (exists) {
                    dto.setSavedToDb(false);
                    skipped++;
                    continue;
                }

                // 3. Build Job entity
                Job job = new Job();
                job.setTitle(dto.getTitle().trim());

                // Build rich description with apply link and source
                String applyLink = dto.getUrl() != null ? dto.getUrl() : (dto.getLink() != null ? dto.getLink() : "#");
                StringBuilder desc = new StringBuilder();
                if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
                    desc.append(dto.getDescription().trim());
                } else {
                    desc.append("Exciting opportunity for a ").append(dto.getTitle()).append(" at ").append(companyName).append(".");
                }
                desc.append("\n\n---\n")
                        .append("🔗 **Apply Link**: ").append(applyLink).append("\n")
                        .append("🌐 **Source**: ").append(dto.getSource() != null ? dto.getSource() : "Aggregator API");

                // Truncate to safe column limit (max 5000 characters)
                String descStr = desc.toString();
                if (descStr.length() > 4900) {
                    descStr = descStr.substring(0, 4900) + "...";
                }
                job.setDescription(descStr);

                job.setLocation((dto.getLocation() != null && !dto.getLocation().isBlank()) ? dto.getLocation() : "Remote");
                job.setType(determineJobType(dto));
                job.setWorkMode(determineWorkMode(dto));
                job.setJobSource(com.job.enums.JobSource.AGGREGATED);
                job.setSourcePlatform(dto.getSource() != null ? dto.getSource() : "Aggregator");
                job.setExternalApplyUrl(applyLink);
                job.setPostedAt(LocalDateTime.now());
                job.setEmployer(employer);

                if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
                    job.setRequiredSkills(new ArrayList<>(dto.getSkills()));
                } else {
                    job.setRequiredSkills(new ArrayList<>(List.of("Software Engineering", "Problem Solving")));
                }

                job.setResponsibilities(new ArrayList<>(List.of(
                        "Design, build, and maintain scalable solutions.",
                        "Collaborate with engineering and product teams to deliver high quality features.",
                        "Participate in code reviews and engineering best practices."
                )));

                jobRepository.save(job);
                dto.setSavedToDb(true);
                inserted++;

            } catch (Exception e) {
                log.warn("Failed to persist job '{}': {}", dto.getTitle(), e.getMessage());
                dto.setSavedToDb(false);
                failed++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("insertedCount", inserted);
        stats.put("skippedCount", skipped);
        stats.put("failedCount", failed);
        return stats;
    }

    private Employer getOrCreateEmployer(String companyName) {
        return employerRepository.findByCompanyNameIgnoreCase(companyName).orElseGet(() -> {
            String slug = companyName.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (slug.isBlank()) slug = "company";
            String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6);

            Employer emp = new Employer();
            emp.setCompanyName(companyName);
            emp.setIndustry("Technology / Software");
            emp.setName(companyName + " Hiring Team");
            emp.setUsername("aggregator_" + slug + "_" + uniqueSuffix);
            emp.setEmail(slug + "_" + uniqueSuffix + "@dinomate.internal");
            emp.setPassword(passwordEncoder.encode("DinoMate@" + UUID.randomUUID()));
            emp.setRole(Role.EMPLOYER);
            emp.setProfilePictureUrl(null);
            return employerRepository.save(emp);
        });
    }

    private JobType determineJobType(AggregatorJobDTO dto) {
        String level = dto.getExperienceLevel() != null ? dto.getExperienceLevel().toUpperCase() : "";
        String title = dto.getTitle() != null ? dto.getTitle().toUpperCase() : "";

        if (level.contains("INTERN") || title.contains("INTERN")) {
            return JobType.INTERNSHIP;
        }
        if (title.contains("CONTRACT") || title.contains("FREELANCE")) {
            return JobType.CONTRACT;
        }
        if (title.contains("PART-TIME") || title.contains("PART TIME")) {
            return JobType.PART_TIME;
        }
        return JobType.FULL_TIME;
    }

    private WorkMode determineWorkMode(AggregatorJobDTO dto) {
        String wm = dto.getWorkMode() != null ? dto.getWorkMode().toUpperCase() : "";
        String loc = dto.getLocation() != null ? dto.getLocation().toUpperCase() : "";

        if (wm.contains("REMOTE") || loc.contains("REMOTE")) {
            return WorkMode.REMOTE;
        }
        if (wm.contains("HYBRID") || loc.contains("HYBRID")) {
            return WorkMode.HYBRID;
        }
        if (wm.contains("ONSITE") || wm.contains("ON-SITE") || wm.contains("IN-OFFICE")) {
            return WorkMode.ONSITE;
        }
        return WorkMode.HYBRID;
    }

    @Override
    public Map<String, List<String>> getPlatformClusters() {
        Map<String, List<String>> clusters = new LinkedHashMap<>();
        clusters.put("High-Growth Startups & Unicorns", List.of("greenhouse", "lever", "ashby", "wellfound"));
        clusters.put("Big Tech Giants (FAANG / AI Labs)", List.of("google", "amazon", "microsoft", "apple", "meta", "openai", "anthropic", "nvidia"));
        clusters.put("SDE Internships & Early Career", List.of("internshala", "greenhouse", "ashby", "linkedin", "google", "microsoft"));
        clusters.put("Remote-First & Developer Hubs", List.of("weworkremotely", "remotive", "remoteok", "himalayas", "hackernews"));
        clusters.put("Indian Tech Market", List.of("naukri", "internshala", "linkedin", "indeed"));
        clusters.put("General High Volume (Global)", List.of("linkedin", "indeed", "glassdoor", "ziprecruiter", "adzuna"));
        return clusters;
    }
}
