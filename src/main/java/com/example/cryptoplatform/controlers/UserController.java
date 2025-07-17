package com.example.cryptoplatform.controlers;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.models.ApplicationUser;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {
    private final AuthContextManager authContextManager;

    @GetMapping("/me")
    public ApplicationUser getLoggedUser() {
        return authContextManager.getLoggedInUser();
    }
}
