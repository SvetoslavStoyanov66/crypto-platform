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

    public void insert(Transaction tx, Integer userId) {
        String sql = "INSERT INTO transactions (user_id, timestamp, type, asset, amount) VALUES (?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql,
                userId,
                Timestamp.from(tx.getTimestamp()),
                tx.getType().name(),
                tx.getAsset(),
                tx.getAmount()
        );
    }
    public void save(List<Transaction> transactions, Integer userId) {
        String checkSql = """
        SELECT COUNT(*) FROM transactions
        WHERE user_id = ? AND timestamp = ? AND type = ? AND asset = ?
    """;

        String updateSql = """
        UPDATE transactions
        SET amount = ?
        WHERE user_id = ? AND timestamp = ? AND type = ? AND asset = ?
    """;

        String insertSql = """
        INSERT INTO transactions (user_id, timestamp, type, asset, amount)
        VALUES (?, ?, ?, ?, ?)
    """;

        for (Transaction tx : transactions) {
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class,
                    userId,
                    Timestamp.from(tx.getTimestamp()),
                    tx.getType().name(),
                    tx.getAsset());

            if (count != null && count > 0) {
                jdbcTemplate.update(updateSql,
                        tx.getAmount(),
                        userId,
                        Timestamp.from(tx.getTimestamp()),
                        tx.getType().name(),
                        tx.getAsset());
            } else {
                jdbcTemplate.update(insertSql,
                        userId,
                        Timestamp.from(tx.getTimestamp()),
                        tx.getType().name(),
                        tx.getAsset(),
                        tx.getAmount());
            }
        }
    }

}
