package com.job.service.impl;

import com.job.dto.aggregator.AggregatorJobDTO;
import com.job.dto.aggregator.AggregatorScrapeRequestDTO;
import com.job.dto.aggregator.AggregatorScrapeResponseDTO;
import com.job.entity.AggregatedJob;
import com.job.repository.AggregatedJobRepository;
import com.job.service.interfaces.IAggregatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class AggregatorServiceImpl implements IAggregatorService {

    private final AggregatedJobRepository aggregatedJobRepository;

    @Value("${aggregator.api.url:http://localhost:3001/api/scrape}")
    private String aggregatorApiUrl;

    @Value("${aggregator.api.secret:nope}")
    private String secret;

    @Value("${aggregator.api.email:ashutoshmaurya585@gmail.com}")
    private String adminEmail;

    private RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    private String resolveScrapeEndpoint() {
        String url = aggregatorApiUrl != null && !aggregatorApiUrl.isBlank()
                ? aggregatorApiUrl.trim()
                : "http://localhost:3001/api/scrape";
        if (!url.endsWith("/api/scrape")) {
            if (url.endsWith("/")) {
                url = url + "api/scrape";
            } else {
                url = url + "/api/scrape";
            }
        }
        return url;
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
            request.setDryRun(false);
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
        String targetUrl = resolveScrapeEndpoint();

        try {
            log.info("Dispatching scrape call to DinoMate API: {} for keyword='{}', location='{}', sources={}, dryRun={}",
                    targetUrl, request.getKeyword(), request.getLocation(), request.getSources(), request.getDryRun());

            ResponseEntity<AggregatorScrapeResponseDTO> response = getRestTemplate().exchange(
                    Objects.requireNonNull(targetUrl),
                    Objects.requireNonNull(HttpMethod.POST),
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
            log.warn("DinoMate Aggregator service unreachable at {}: {}", targetUrl, e.getMessage());
            return AggregatorScrapeResponseDTO.builder()
                    .success(false)
                    .keyword(request.getKeyword())
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .message("DinoMate Aggregator API at " + targetUrl + " is currently offline or unreachable.")
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

                // 1. Check for duplicate job
                boolean exists = aggregatedJobRepository.existsByTitleIgnoreCaseAndCompanyNameIgnoreCase(dto.getTitle().trim(), companyName);
                if (exists) {
                    dto.setSavedToDb(false);
                    skipped++;
                    continue;
                }

                // 2. Build AggregatedJob entity
                AggregatedJob job = new AggregatedJob();
                job.setTitle(dto.getTitle().trim());
                job.setCompanyName(companyName);

                // Description
                String descStr = dto.getDescription();
                if (descStr != null && descStr.length() > 4900) {
                    descStr = descStr.substring(0, 4900) + "...";
                }
                job.setDescription(descStr != null ? descStr : "");

                job.setLocation((dto.getLocation() != null && !dto.getLocation().isBlank()) ? dto.getLocation() : "Remote");
                job.setExperienceLevel(dto.getExperienceLevel());
                job.setWorkMode(dto.getWorkMode());
                
                String applyLink = dto.getUrl() != null ? dto.getUrl() : (dto.getLink() != null ? dto.getLink() : "#");
                job.setUrl(applyLink);
                job.setSourcePlatform(dto.getSource() != null ? dto.getSource() : "Aggregator");
                
                job.setSalaryMin(dto.getSalaryMin() != null ? dto.getSalaryMin().intValue() : null);
                job.setSalaryMax(dto.getSalaryMax() != null ? dto.getSalaryMax().intValue() : null);
                job.setCurrency(dto.getCurrency());
                
                job.setPostedAt(LocalDateTime.now());
                job.setScrapedAt(LocalDateTime.now());

                if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
                    job.setRequiredSkills(new ArrayList<>(dto.getSkills()));
                } else {
                    job.setRequiredSkills(new ArrayList<>(List.of("Software Engineering")));
                }

                aggregatedJobRepository.save(job);
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

    @Override
    public Page<AggregatedJob> getSavedJobs(int page, int size) {
        return aggregatedJobRepository.findAllByOrderByScrapedAtDesc(PageRequest.of(page, size));
    }
}
