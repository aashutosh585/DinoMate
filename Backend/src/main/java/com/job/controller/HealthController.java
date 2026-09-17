package com.job.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class HealthController {

    private final ObjectProvider<RedisConnectionFactory> redisConnectionFactoryProvider;

    @GetMapping({"/", "/health", "/api/health", "/ping"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("app", "DinoMate API");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        RedisConnectionFactory factory = redisConnectionFactoryProvider.getIfAvailable();
        if (factory != null) {
            try (RedisConnection connection = factory.getConnection()) {
                String pingResult = connection.ping();
                response.put("redis", "CONNECTED (" + pingResult + ")");
            } catch (Exception e) {
                log.warn("Redis ping failed during health check: {}", e.getMessage());
                response.put("redis", "DISCONNECTED: " + e.getMessage());
            }
        } else {
            response.put("redis", "NOT_CONFIGURED");
        }

        response.put("message", "DinoMate Backend is healthy and running.");
        return ResponseEntity.ok(response);
    }
}
