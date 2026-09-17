package com.job.service.interfaces;

import com.job.dto.aggregator.AggregatorScrapeRequestDTO;
import com.job.dto.aggregator.AggregatorScrapeResponseDTO;

import com.job.entity.AggregatedJob;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface IAggregatorService {
    AggregatorScrapeResponseDTO scrapeAndSync(AggregatorScrapeRequestDTO request);
    Map<String, List<String>> getPlatformClusters();
    Page<AggregatedJob> getSavedJobs(int page, int size);
}
