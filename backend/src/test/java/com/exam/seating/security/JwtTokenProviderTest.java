package com.exam.seating.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long testExpirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationInMs", testExpirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token with username and role")
    void shouldGenerateValidToken() {
        String token = tokenProvider.generateToken("admin", "ADMIN");

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("admin", tokenProvider.getUsernameFromToken(token));
        assertEquals("ROLE_ADMIN", tokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Should validate role normalization when role prefix is already present")
    void shouldNormalizeRole() {
        String token = tokenProvider.generateToken("faculty", "ROLE_FACULTY");

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("faculty", tokenProvider.getUsernameFromToken(token));
        assertEquals("ROLE_FACULTY", tokenProvider.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Should reject invalid or malformed token")
    void shouldRejectInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.structure"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }

    @Test
    @DisplayName("Should reject expired token")
    void shouldRejectExpiredToken() {
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationInMs", -1000L); // Expired in the past
        String expiredToken = tokenProvider.generateToken("student", "STUDENT");

        assertFalse(tokenProvider.validateToken(expiredToken));
    }
}
