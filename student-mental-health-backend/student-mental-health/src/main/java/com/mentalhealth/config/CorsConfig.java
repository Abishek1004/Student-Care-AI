package com.mentalhealth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Configures CORS so the React frontend can call this backend.
 *
 * In production, replace "*" with your actual frontend origin, e.g.:
 *   "https://your-app.vercel.app"
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow React dev server and production origins
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",   // React dev
                "http://localhost:5173",   // Vite dev
                "https://*.vercel.app",    // Vercel deployments
                "https://*.netlify.app"    // Netlify deployments
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
