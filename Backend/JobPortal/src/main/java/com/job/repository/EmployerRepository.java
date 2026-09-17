package com.job.repository;

import com.job.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, Long> {
    java.util.Optional<Employer> findByCompanyNameIgnoreCase(String companyName);
    java.util.Optional<Employer> findByUsername(String username);
}
