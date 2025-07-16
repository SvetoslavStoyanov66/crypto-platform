package com.example.cryptoplatform.models;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private ApplicationUser user;
    private String jwt;
}
