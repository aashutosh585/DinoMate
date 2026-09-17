package com.job.repository;

import com.job.entity.AggregatedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AggregatedJobRepository extends JpaRepository<AggregatedJob, Long> {
    boolean existsByTitleIgnoreCaseAndCompanyNameIgnoreCase(String title, String companyName);
    Page<AggregatedJob> findAllByOrderByScrapedAtDesc(Pageable pageable);
}
