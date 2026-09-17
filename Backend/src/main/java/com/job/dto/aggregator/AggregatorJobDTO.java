package com.job.dto.aggregator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AggregatorJobDTO {
    private String title;
    private String normalizedTitle;
    private String company;
    private String location;
    private String city;
    private String country;
    private String workMode;
    private String experienceLevel;
    private String description;
    private String url;
    private String link;
    private String source;
    private List<String> skills;
    private Double salaryMin;
    private Double salaryMax;
    private String currency;
    private String externalId;
    private String fingerprint;
    private String publishedAt;
    private Boolean isActive;
    private Boolean savedToDb;
}
