package com.job.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/health", "/api/health", "/ping"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "DinoMate API",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "message", "DinoMate Backend is healthy and running."
        ));
    }
}
