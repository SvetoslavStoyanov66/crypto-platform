package com.example.cryptoplatform;

import com.example.cryptoplatform.models.*;
import com.example.cryptoplatform.repository.RoleRepository;
import com.example.cryptoplatform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
public class CryptoPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(CryptoPlatformApplication.class, args);
	}

	@Bean
	CommandLineRunner run(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncode){
		return args ->{
			if(roleRepository.findByAuthority("USER").isPresent()) return;
			Role userRole = roleRepository.save(new Role("USER"));

			Set<Role> roles = new HashSet<>();
			roles.add(userRole);

			ApplicationUser user = new ApplicationUser("user", passwordEncode.encode("password"), roles, new Wallet(), List.of(new Transaction(1, Instant.now(), TransactionType.BUY, "ETH", BigDecimal.valueOf(12))));

			System.out.println(userRepository.save(user));
		};
	}

}
