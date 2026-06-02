package com.inventory.controller;

import com.inventory.dto.AuthRequest;
import com.inventory.dto.AuthResponse;
import com.inventory.entity.User;
import com.inventory.entity.LoginAuditLog;
import com.inventory.repository.UserRepository;
import com.inventory.repository.LoginAuditLogRepository;
import com.inventory.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginAuditLogRepository loginAuditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
            
            // Login Success - log to DB
            saveAuditLog(authRequest.getUsername(), "SUCCESS", clientIp);
            
            User user = userRepository.findByUsername(authRequest.getUsername()).orElse(null);
            String role = (user != null) ? user.getRole() : "USER";
            String jwt = jwtUtil.generateToken(authRequest.getUsername(), role);
            return ResponseEntity.ok(new AuthResponse(jwt, authRequest.getUsername(), role));
            
        } catch (BadCredentialsException e) {
            // Login Failed - log to DB
            saveAuditLog(authRequest.getUsername(), "FAILED", clientIp);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest authRequest) {
        if (userRepository.findByUsername(authRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }

        // Add optional password length/strength validation as a secure authentication feature
        if (authRequest.getPassword() == null || authRequest.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long"));
        }

        User user = new User();
        user.setUsername(authRequest.getUsername());
        user.setPassword(passwordEncoder.encode(authRequest.getPassword()));
        
        // Handle Role configuration during registration
        String role = authRequest.getRole();
        if (role == null || role.trim().isEmpty()) {
            user.setRole("USER");
        } else {
            String upperRole = role.trim().toUpperCase();
            if (upperRole.equals("ADMIN") || upperRole.equals("MANAGER") || upperRole.equals("USER")) {
                user.setRole(upperRole);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Allowed roles: USER, MANAGER, ADMIN"));
            }
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    private void saveAuditLog(String username, String status, String ipAddress) {
        try {
            LoginAuditLog log = new LoginAuditLog();
            log.setUsername(username);
            log.setStatus(status);
            log.setTimestamp(LocalDateTime.now());
            log.setIpAddress(ipAddress);
            loginAuditLogRepository.save(log);
        } catch (Exception e) {
            // Don't fail the authentication request if audit logging database fails
            System.err.println("Failed to write authentication audit log: " + e.getMessage());
        }
    }
}
