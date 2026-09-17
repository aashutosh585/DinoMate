package com.job.dto.aggregator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AggregatorScrapeResponseDTO {
    private Boolean success;
    private String keyword;
    private Integer fetchedRaw;
    private Integer normalizedCount;
    private Integer duplicatesRemoved;
    private List<String> sourcesRun;
    private List<AggregatorJobDTO> jobs;
    private List<String> errors;
    private Long executionTimeMs;
    private Map<String, Object> dbStats;
    private String message;
}
