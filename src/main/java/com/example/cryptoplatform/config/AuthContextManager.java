package com.example.cryptoplatform.config;

import com.example.cryptoplatform.exceptions.AuthException;
import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AuthContextManager {

    UserRepository userRepository;
    public ApplicationUser getLoggedInUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("couldn't find the logged user"));

    }
}
