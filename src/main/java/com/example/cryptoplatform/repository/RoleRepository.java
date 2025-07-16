package com.example.cryptoplatform.repository;

import com.example.cryptoplatform.models.Role;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class RoleRepository {

    private final JdbcTemplate jdbcTemplate;

    public Optional<Role> findByAuthority(String authority) {
        String sql = "SELECT role_id, authority FROM roles WHERE authority = ?";

        try {
            Role role = jdbcTemplate.queryForObject(sql, roleRowMapper, authority);
            return Optional.ofNullable(role);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private final RowMapper<Role> roleRowMapper = (rs, rowNum) -> {
        Role role = new Role();
        role.setRoleId(rs.getInt("role_id"));
        role.setAuthority(rs.getString("authority"));
        return role;
    };

    public Role save(Role role) {
        String sql = "INSERT INTO roles (authority) VALUES (?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"role_id"});
            ps.setString(1, role.getAuthority());
            return ps;
        }, keyHolder);

        int generatedId = keyHolder.getKey().intValue();
        role.setRoleId(generatedId);
        return role;
    }
}
