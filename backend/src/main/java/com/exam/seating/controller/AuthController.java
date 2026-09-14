package com.exam.seating.controller;

import com.exam.seating.dto.AuthResponse;
import com.exam.seating.dto.LoginRequest;
import com.exam.seating.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final com.exam.seating.repository.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Authenticating login request for username: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STUDENT");

        // Normalize role name without prefix (e.g. ROLE_ADMIN -> ADMIN)
        String cleanRole = role.replaceFirst("^ROLE_", "");

        String department = userRepository.findByUsername(authentication.getName())
                .map(com.exam.seating.entity.User::getDepartment)
                .orElse(null);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .username(authentication.getName())
                .role(cleanRole)
                .department(department)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STUDENT")
                .replaceFirst("^ROLE_", "");

        String department = userRepository.findByUsername(authentication.getName())
                .map(com.exam.seating.entity.User::getDepartment)
                .orElse(null);

        Map<String, Object> profile = new HashMap<>();
        profile.put("username", authentication.getName());
        profile.put("role", role);
        profile.put("department", department);
        profile.put("authenticated", true);

        return ResponseEntity.ok(profile);
    }
}
