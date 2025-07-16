package com.example.cryptoplatform.repository;

import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.models.Role;
import lombok.AllArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Repository
@AllArgsConstructor
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;


    public Optional<ApplicationUser> findByUsername(String username) {
        String sql = "SELECT user_id, username, password FROM users WHERE username = ?";

        try {
            ApplicationUser user = jdbcTemplate.queryForObject(sql, userRowMapper, username);
            if (user != null) {
                Set<Role> roles = findRolesByUserId(user.getUserId());
                user.setAuthorities(roles);
            }
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Set<Role> findRolesByUserId(Integer userId) {
        String sql = "SELECT r.role_id, r.authority " +
                "FROM roles r " +
                "JOIN user_role_junction ur ON r.role_id = ur.role_id " +
                "WHERE ur.user_id = ?";

        return new HashSet<>(jdbcTemplate.query(sql, roleRowMapper, userId));
    }

    private final RowMapper<Role> roleRowMapper = (rs, rowNum) -> {
        Role role = new Role();
        role.setRoleId(rs.getInt("role_id"));
        role.setAuthority(rs.getString("authority"));
        return role;
    };

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

        return user;
    }
}
