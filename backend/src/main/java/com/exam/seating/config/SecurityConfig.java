package com.exam.seating.config;

import com.exam.seating.security.JwtAccessDeniedHandler;
import com.exam.seating.security.JwtAuthenticationEntryPoint;
import com.exam.seating.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    private final com.exam.seating.security.CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    private org.springframework.security.authentication.dao.DaoAuthenticationProvider buildAuthenticationProvider() {
        org.springframework.security.authentication.dao.DaoAuthenticationProvider authProvider =
                new org.springframework.security.authentication.dao.DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authenticationProvider(buildAuthenticationProvider());
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 1. CORS Pre-flight Options Requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 2. Public Static Assets & Angular SPA Views
                .requestMatchers(HttpMethod.GET, "/", "/index.html", "/favicon.ico", "/*.js", "/*.css", "/*.map", "/*.txt", "/assets/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/login", "/dashboard/**", "/students/**", "/exams/**", "/halls/**", "/faculty/**", "/seating/**", "/attendance/**", "/reports/**", "/incidents/**", "/hod/**", "/audit-logs/**").permitAll()
                .requestMatchers("/api/health/**", "/api/ping/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/seating/student/**").permitAll()

                // 3. Faculty Duty Assignments & Management
                .requestMatchers(HttpMethod.GET, "/api/faculty/assignments/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers("/api/faculty/assignments/**").hasRole("ADMIN")
                .requestMatchers("/api/faculty/**").hasRole("ADMIN")

                // HOD Portal Endpoints
                .requestMatchers("/api/hod/**").hasAnyRole("ADMIN", "HOD")

                // Reports & Admit Card PDF
                .requestMatchers(HttpMethod.GET, "/api/reports/export/pdf/admit-card/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT", "HOD")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "FACULTY", "HOD")

                // Malpractice & Exam Incidents
                .requestMatchers("/api/incidents/**").hasAnyRole("ADMIN", "FACULTY", "HOD")

                // Audit Logs & Security Trail
                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")

                // Seating Automation
                .requestMatchers("/api/seating/generate/**").hasAnyRole("ADMIN", "HOD")
                .requestMatchers("/api/seating/regenerate/**").hasAnyRole("ADMIN", "HOD")
                .requestMatchers("/api/seating/validate-conflicts/**").hasAnyRole("ADMIN", "HOD")
                .requestMatchers(HttpMethod.DELETE, "/api/seating/**").hasRole("ADMIN")

                // Student Modification (Admin can manage all, HOD can import/register candidates for their branch)
                .requestMatchers(HttpMethod.POST, "/api/students/**").hasAnyRole("ADMIN", "HOD")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasRole("ADMIN")

                // Hall & Seat Modification restricted to Admin
                .requestMatchers(HttpMethod.POST, "/api/halls/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/halls/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/halls/**").hasRole("ADMIN")

                // Exam Modification restricted to Admin
                .requestMatchers(HttpMethod.POST, "/api/exams/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasRole("ADMIN")

                // 4a. Student self-profile (must be before the restrictive student rule)
                .requestMatchers(HttpMethod.GET, "/api/students/me").authenticated()

                // 4. Admin, Faculty, and HOD (Invigilation, Student viewing & Attendance)
                .requestMatchers(HttpMethod.GET, "/api/students/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "FACULTY")

                // 5. Admin, Faculty, Students, and HOD (View exam schedule, view halls, view seating grid)
                .requestMatchers(HttpMethod.GET, "/api/halls/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/seats/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/exams/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/seating/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT", "HOD")

                // 6. Any other request requires authentication
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
