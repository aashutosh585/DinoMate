package com.job.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(nullable = false)
    private String companyName;

    private String location;

    private String experienceLevel;
    
    private String workMode;

    @Column(length = 2000)
    private String url;

    private String sourcePlatform;
    
    private Integer salaryMin;
    
    private Integer salaryMax;
    
    private String currency;

    private LocalDateTime postedAt;
    
    private LocalDateTime scrapedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @BatchSize(size = 25)
    private List<String> requiredSkills;
}
