package com.job.controller;

import com.job.dto.aggregator.AggregatorScrapeRequestDTO;
import com.job.dto.aggregator.AggregatorScrapeResponseDTO;
import com.job.service.interfaces.IAggregatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import com.job.entity.AggregatedJob;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/aggregator")
@RequiredArgsConstructor
public class AggregatorController {

    private final IAggregatorService aggregatorService;

    @PostMapping("/scrape")
    public ResponseEntity<AggregatorScrapeResponseDTO> scrapeAndSync(@RequestBody(required = false) AggregatorScrapeRequestDTO request) {
        if (request == null) {
            request = new AggregatorScrapeRequestDTO();
        }
        log.info("Received scrape request: keyword='{}', location='{}', sources={}, dryRun={}",
                request.getKeyword(), request.getLocation(), request.getSources(), request.getDryRun());

        AggregatorScrapeResponseDTO response = aggregatorService.scrapeAndSync(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/clusters")
    public ResponseEntity<Map<String, List<String>>> getPlatformClusters() {
        return ResponseEntity.ok(aggregatorService.getPlatformClusters());
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<AggregatedJob>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(aggregatorService.getSavedJobs(page, size));
    }
}
