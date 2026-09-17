package com.job.security;

import com.job.entity.Employer;
import com.job.entity.JobSeeker;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.repository.EmployerRepository;
import com.job.repository.JobSeekerRepository;
import com.job.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobSeekerRepository jobSeekerRepository;

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
                                    @org.springframework.lang.NonNull HttpServletResponse response,
                                    @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No token found in Authorization header for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        log.debug("JWT token received for request: {}", request.getRequestURI());
        String token = authHeader.substring(7);

        String username;
        try {
            username = jwtUtil.extractUsername(token);
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT for request: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"TOKEN_EXPIRED\",\"message\":\"Your session has expired, please log in again\"}"
            );
            return;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT for request {}: {}", request.getRequestURI(), e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"INVALID_TOKEN\",\"message\":\"Invalid or malformed authentication token\"}"
            );
            return;
        }

        if (username == null || username.isBlank()) {
            log.error("Could not extract valid username from token for request: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"INVALID_TOKEN\",\"message\":\"Token contains no valid user identity\"}"
            );
            return;
        }

        log.debug("Username extracted from token: {}", username);

        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            log.warn("No user found with username: {}", username);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"USER_NOT_FOUND\",\"message\":\"User associated with this token was not found\"}"
            );
            return;
        }

        User user = optionalUser.get();

        String roleName = "ROLE_" + user.getRole().name();
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(user, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        log.debug("Security context set for user: {} with role: {}", username, roleName);

        if (user.getRole() == Role.EMPLOYER) {
            Optional<Employer> employer = employerRepository.findById(Objects.requireNonNull(user.getId()));
            if (employer.isPresent()) {
                request.setAttribute("user", employer.get());
            } else {
                log.warn("Employer record not found for user id: {}", user.getId());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"INVALID_USER\",\"message\":\"Employer profile is incomplete\"}");
                return;
            }
        } else if (user.getRole() == Role.JOB_SEEKER) {
            Optional<JobSeeker> jobSeeker = jobSeekerRepository.findById(Objects.requireNonNull(user.getId()));
            if (jobSeeker.isPresent()) {
                request.setAttribute("user", jobSeeker.get());
            } else {
                log.warn("JobSeeker record not found for user id: {}", user.getId());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"INVALID_USER\",\"message\":\"Job seeker profile is incomplete\"}");
                return;
            }
        } else {
            request.setAttribute("user", user);
        }

        filterChain.doFilter(request, response);
    }
}
