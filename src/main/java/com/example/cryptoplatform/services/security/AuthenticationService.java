package com.example.cryptoplatform.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import com.example.cryptoplatform.models.*;
import com.example.cryptoplatform.services.security.TokenService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cryptoplatform.repository.RoleRepository;
import com.example.cryptoplatform.repository.UserRepository;

@Service
@Transactional
@AllArgsConstructor
public class AuthenticationService {

    private UserRepository userRepository;

    private RoleRepository roleRepository;

    private PasswordEncoder passwordEncoder;

    private AuthenticationManager authenticationManager;

    private TokenService tokenService;

    public ApplicationUser registerUser(String username, String password){

        String encodedPassword = passwordEncoder.encode(password);
        Role userRole = roleRepository.findByAuthority("USER").get();

        Set<Role> authorities = new HashSet<>();

        authorities.add(userRole);

        return userRepository.save(new ApplicationUser(username, encodedPassword, authorities, new Wallet(), new ArrayList<>()));
    }

    public LoginResponseDTO loginUser(String username, String password){

        try{
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            String token = tokenService.generateJwt(auth);

            return new LoginResponseDTO(userRepository.findByUsername(username).get(), token);

        } catch(AuthenticationException e){
            System.out.println(e.getMessage());
            return new LoginResponseDTO(null, "");
        }
    }

}