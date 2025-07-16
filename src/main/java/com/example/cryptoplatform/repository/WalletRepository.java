package com.example.cryptoplatform.repository;

import com.example.cryptoplatform.models.Wallet;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class WalletRepository {

    private final JdbcTemplate jdbcTemplate;

    public WalletRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Wallet findWalletByUserId(Integer userId) {
        try {
            String walletSql = "SELECT wallet_id, usd_balance FROM wallets WHERE user_id = ?";
            return jdbcTemplate.queryForObject(walletSql, (rs, rowNum) -> {
                int walletId = rs.getInt("wallet_id");
                Wallet wallet = new Wallet();
                wallet.setWalletId(walletId);
                wallet.setUsdBalance(rs.getBigDecimal("usd_balance"));
                wallet.setCrypto(findCryptoBalancesByWalletId(walletId));
                return wallet;
            }, userId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    private HashMap<String, BigDecimal> findCryptoBalancesByWalletId(Integer walletId) {
        String sql = "SELECT crypto_symbol, amount FROM crypto_balances WHERE wallet_id = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, walletId);

        HashMap<String, BigDecimal> cryptoBalances = new HashMap<>();
        for (Map<String, Object> row : rows) {
            String symbol = (String) row.get("crypto_symbol");
            BigDecimal amount = (BigDecimal) row.get("amount");
            cryptoBalances.put(symbol, amount);
        }
        return cryptoBalances;
    }

    public void save(Wallet wallet, Integer userId) {
        String checkSql = "SELECT COUNT(*) FROM wallets WHERE user_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId);

        if (count != null && count > 0) {
            String updateSql = "UPDATE wallets SET usd_balance = ? WHERE user_id = ?";
            jdbcTemplate.update(updateSql, wallet.getUsdBalance(), userId);

            Integer walletId = jdbcTemplate.queryForObject("SELECT wallet_id FROM wallets WHERE user_id = ?", Integer.class, userId);

            jdbcTemplate.update("DELETE FROM crypto_balances WHERE wallet_id = ?", walletId);

            insertCryptoBalances(wallet.getCrypto(), walletId);

        } else {
            String insertSql = "INSERT INTO wallets (user_id, usd_balance) VALUES (?, ?)";
            jdbcTemplate.update(insertSql, userId, wallet.getUsdBalance());

            Integer walletId = jdbcTemplate.queryForObject("SELECT wallet_id FROM wallets WHERE user_id = ?", Integer.class, userId);

            insertCryptoBalances(wallet.getCrypto(), walletId);
        }
    }

    private void insertCryptoBalances(HashMap<String, BigDecimal> cryptoBalances, Integer walletId) {
        String insertSql = "INSERT INTO crypto_balances (wallet_id, crypto_symbol, amount) VALUES (?, ?, ?)";
        cryptoBalances.forEach((symbol, amount) -> {
            jdbcTemplate.update(insertSql, walletId, symbol, amount);
        });
    }
}
