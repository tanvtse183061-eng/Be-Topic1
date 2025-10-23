package com.evdealer.config;

import com.evdealer.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                  @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwt = null;
        boolean invalidToken = false;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            final String raw = authorizationHeader.substring(7);
            final String token = raw == null ? null : raw.trim();
            if (token != null && !token.isEmpty()) {
                jwt = token;
                try {
                    username = jwtUtil.extractUsername(jwt);
                } catch (ExpiredJwtException e) {
                    invalidToken = true;
                    logger.warn("JWT expired: " + e.getMessage());
                } catch (MalformedJwtException e) {
                    invalidToken = true;
                    logger.warn("JWT malformed: " + e.getMessage());
                } catch (SignatureException e) {
                    invalidToken = true;
                    logger.warn("JWT signature invalid: " + e.getMessage());
                } catch (IllegalArgumentException e) {
                    invalidToken = true;
                    logger.warn("JWT illegal argument: " + e.getMessage());
                } catch (JwtException e) {
                    invalidToken = true;
                    logger.warn("JWT parse error: " + e.getMessage());
                } catch (Exception e) {
                    invalidToken = true;
                    logger.warn("JWT token extraction failed: " + e.getMessage());
                }
            } else {
                // Bearer header nhưng không có token
                invalidToken = true;
                logger.warn("Authorization header has Bearer prefix but empty token");
            }
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt)) {
                String role = jwtUtil.getRoleFromToken(jwt);
                String userId = jwtUtil.getUserIdFromToken(jwt);
                
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        username, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                // Add user info to request attributes for easy access
                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);
            }
        }
        
        // Nếu client gửi Bearer nhưng token không hợp lệ → trả 401 thay vì âm thầm bỏ qua
        if (invalidToken) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}
