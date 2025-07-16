package com.example.cryptoplatform.repository;

import com.example.cryptoplatform.models.Transaction;
import com.example.cryptoplatform.models.TransactionType;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class TransactionRepository {

    private final JdbcTemplate jdbcTemplate;

    public TransactionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Transaction> findTransactionsByUserId(Integer userId) {
        String sql = "SELECT transaction_id, timestamp, type, asset, amount FROM transactions WHERE user_id = ? ORDER BY timestamp DESC";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Transaction tx = new Transaction();
                tx.setTransactionId(rs.getInt("transaction_id"));
                tx.setTimestamp(rs.getTimestamp("timestamp").toInstant());
                tx.setType(TransactionType.valueOf(rs.getString("type")));
                tx.setAsset(rs.getString("asset"));
                tx.setAmount(rs.getBigDecimal("amount"));
                return tx;
            }, userId);
        } catch (EmptyResultDataAccessException e) {
            return List.of();
        }
    }

    public void saveAll(List<Transaction> transactions, Integer userId) {
        String sql = "INSERT INTO transactions (user_id, timestamp, type, asset, amount) VALUES (?, ?, ?, ?, ?)";

        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                Transaction tx = transactions.get(i);
                ps.setInt(1, userId);
                ps.setObject(2, Timestamp.from(tx.getTimestamp()));
                ps.setString(3, tx.getType().name());
                ps.setString(4, tx.getAsset());
                ps.setBigDecimal(5, tx.getAmount());
            }

            @Override
            public int getBatchSize() {
                return transactions.size();
            }
        });
    }
}
