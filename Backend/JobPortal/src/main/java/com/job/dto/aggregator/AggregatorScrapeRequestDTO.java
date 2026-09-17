package com.job.dto.aggregator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatorScrapeRequestDTO {
    private String keyword;
    private String location;
    private List<String> sources;
    private Integer limit;
    private Boolean dryRun;
    private String triggerSource;
    private String companySlug;
}
