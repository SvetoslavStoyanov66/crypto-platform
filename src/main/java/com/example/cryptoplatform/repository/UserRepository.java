package com.example.cryptoplatform.repository;

import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.models.Role;
import com.example.cryptoplatform.models.Wallet;
import lombok.AllArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.Optional;
import java.util.Set;

@Repository
@AllArgsConstructor
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public Optional<ApplicationUser> findByUsername(String username) {
        String sql = "SELECT user_id, username, password FROM users WHERE username = ?";

        try {
            ApplicationUser user = jdbcTemplate.queryForObject(sql, userRowMapper, username);
            if (user != null) {
                Set<Role> roles = roleRepository.findRolesByUserId(user.getUserId());
                user.setAuthorities(roles);

                Wallet wallet = walletRepository.findWalletByUserId(user.getUserId());
                user.setWallet(wallet);

                user.setTransactionHistory(transactionRepository.findTransactionsByUserId(user.getUserId()));
            }
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private final RowMapper<ApplicationUser> userRowMapper = (rs, rowNum) -> {
        ApplicationUser user = new ApplicationUser();
        user.setId(rs.getInt("user_id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        return user;
    };

    public ApplicationUser save(ApplicationUser user) {
        String sql = "INSERT INTO users (username, password) VALUES (?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"user_id"});
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPassword());
            return ps;
        }, keyHolder);

        int generatedId = keyHolder.getKey().intValue();
        user.setId(generatedId);

        if (user.getAuthorities() != null) {
            user.getAuthorities().forEach(role -> {
                jdbcTemplate.update(
                        "INSERT INTO user_role_junction (user_id, role_id) VALUES (?, ?)",
                        generatedId, role.getRoleId()
                );
            });
        }

        if (user.getWallet() != null) {
            walletRepository.save(user.getWallet(), user.getUserId());
        }

        if (user.getTransactionHistory() != null && !user.getTransactionHistory().isEmpty()) {
            transactionRepository.saveAll(user.getTransactionHistory(), user.getUserId());
        }

        return user;
    }
}
